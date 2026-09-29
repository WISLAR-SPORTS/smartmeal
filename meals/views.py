
import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from .models import MealRedemption, MealService
from .redemption import redeem_meal
from .services import (
    generate_meals_for_all_universities,
    get_current_meal_type,
)
from meals.models import Meal


@login_required
def scanner_page(request):
    """
    Staff scanner page.

    1. Determine the current meal using Kampala time.
    2. Generate today's MealService for that meal if needed.
    3. Do not duplicate existing services/tokens on refresh.
    4. Pass the current meal information to the template.
    """

    # --------------------------------------------------
    # Staff only
    # --------------------------------------------------

    if not request.user.is_staff:
        return render(
            request,
            "403.html",
            status=403,
        )

    # --------------------------------------------------
    # Current Kampala date/time
    # --------------------------------------------------

    now = timezone.localtime()
    today = now.date()

    # --------------------------------------------------
    # Determine current meal
    #
    # Lunch:
    #   12:00 AM -> 4:30 PM
    #
    # Dinner / Saapa:
    #   4:31 PM -> 11:59 PM
    # --------------------------------------------------

    meal_type = get_current_meal_type(now.time())

    # --------------------------------------------------
    # Generate only the current meal
    # --------------------------------------------------

    if meal_type is not None:
        generate_meals_for_all_universities(
            meal_type=meal_type,
            service_date=today,
        )

    # --------------------------------------------------
    # Get today's meal services
    # --------------------------------------------------

    meal_services = (
        MealService.objects
        .filter(
            service_date=today,
            is_active=True,
            meal__is_active=True,
            meal__university__is_active=True,
        )
        .select_related(
            "meal",
            "meal__university",
        )
        .order_by("starts_at")
    )

    # --------------------------------------------------
    # Friendly display information for the template
    # --------------------------------------------------

    if meal_type == Meal.MealType.LUNCH:
        current_meal_name = "Lunch"
        current_meal_time = "00:00 - 16:30"

    elif meal_type == Meal.MealType.DINNER:
        current_meal_name = "Dinner / Saapa"
        current_meal_time = "16:31 - 23:59"

    else:
        current_meal_name = None
        current_meal_time = None

    # --------------------------------------------------
    # Render scanner
    # --------------------------------------------------

    return render(
        request,
        "meals/scanner.html",
        {
            "meal_services": meal_services,
            "today": today,
            "meal_type": meal_type,
            "current_meal_type": meal_type,
            "current_meal_name": current_meal_name,
            "current_meal_time": current_meal_time,
        },
    )


@login_required
@require_POST
def redeem_meal_view(request):
    """
    API endpoint called by the QR scanner.

    The QR token identifies the MealToken, which in turn
    identifies the student and meal service.

    The client must NOT provide a meal_service_id.
    """

    # --------------------------------------------------
    # Staff only
    # --------------------------------------------------

    if not request.user.is_staff:
        return JsonResponse(
            {
                "success": False,
                "message": "You are not authorized to redeem meals.",
            },
            status=403,
        )

    # --------------------------------------------------
    # Parse JSON
    # --------------------------------------------------

    try:
        data = json.loads(request.body)

    except json.JSONDecodeError:
        return JsonResponse(
            {
                "success": False,
                "message": "Invalid JSON request.",
            },
            status=400,
        )

    # --------------------------------------------------
    # Get QR token
    # --------------------------------------------------

    qr_token = data.get("qr_token")

    if not qr_token:
        return JsonResponse(
            {
                "success": False,
                "message": "QR token is required.",
            },
            status=400,
        )

    # --------------------------------------------------
    # Secure redemption
    #
    # redeem_meal() determines the MealService from
    # the MealToken.
    # --------------------------------------------------

    result = redeem_meal(
        token=qr_token,
        scanned_by=request.user,
    )

    # --------------------------------------------------
    # Successful redemption
    # --------------------------------------------------

    if result["success"]:
        return JsonResponse(
            result,
            status=200,
        )

    # --------------------------------------------------
    # Token already redeemed
    # --------------------------------------------------

    if result.get("result") == "already_redeemed":
        return JsonResponse(
            result,
            status=409,
        )

    # --------------------------------------------------
    # Token/card does not exist
    # --------------------------------------------------

    if result.get("result") == "invalid_card":
        return JsonResponse(
            result,
            status=404,
        )

    # --------------------------------------------------
    # Other redemption errors
    # --------------------------------------------------

    return JsonResponse(
        result,
        status=400,
    )


@login_required
@require_GET
def redemption_history(request):
    """
    Staff view showing redemption history.
    """

    # --------------------------------------------------
    # Staff only
    # --------------------------------------------------

    if not request.user.is_staff:
        return JsonResponse(
            {
                "success": False,
                "message": "You are not authorized.",
            },
            status=403,
        )

    # --------------------------------------------------
    # Get redemption history
    # --------------------------------------------------

    redemptions = (
        MealRedemption.objects
        .select_related(
            "student",
            "meal_card",
            "meal_service",
            "meal_service__meal",
            "scanned_by",
        )
        .order_by("-redeemed_at")
    )

    # --------------------------------------------------
    # Render history
    # --------------------------------------------------

    return render(
        request,
        "meals/redemption_history.html",
        {
            "redemptions": redemptions,
        },
    )

