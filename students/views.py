
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.utils import timezone

from meals.models import MealRedemption, MealService, MealToken




from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.utils import timezone

from meals.models import MealService, MealToken, MealRedemption, Meal
from .models import MealCard


def landing(request):
    return render(request, "students/landing.html")


@login_required
def student_dashboard(request):

    # ==========================================================
    # GET CURRENT STUDENT
    # ==========================================================

    student = request.user.student_profile

    today = timezone.localdate()
    now = timezone.now()

    # ==========================================================
    # ACTIVE MEAL CARD
    # ==========================================================

    meal_card = (
        MealCard.objects
        .filter(
            student=student,
            status=MealCard.Status.ACTIVE,
        )
        .first()
    )

    # ==========================================================
    # TODAY'S MEAL SERVICES
    # ==========================================================

    meal_services = (
        MealService.objects
        .filter(
            university=student.university,
            service_date=today,
        )
        .select_related("meal")
        .order_by("starts_at")
    )

    # ==========================================================
    # STUDENT REDEMPTIONS
    # ==========================================================

    redemptions = (
        MealRedemption.objects
        .filter(
            student=student,
        )
        .select_related(
            "meal_service",
            "meal_service__meal",
        )
        .order_by("-redeemed_at")
    )

    # ==========================================================
    # SUCCESSFUL REDEMPTIONS
    # ==========================================================

    successful_redemptions = redemptions.filter(
        status=MealRedemption.Status.SUCCESS,
    ).count()

    # ==========================================================
    # TODAY'S SUCCESSFUL REDEMPTIONS
    # ==========================================================

    today_redemptions = redemptions.filter(
        redeemed_at__date=today,
        status=MealRedemption.Status.SUCCESS,
    ).count()

    # ==========================================================
    # TOTAL MEALS
    # ==========================================================

    total_redemptions = successful_redemptions

    # ==========================================================
    # FIND REDEEMED SERVICES TODAY
    # ==========================================================

    redeemed_service_ids = set(
        redemptions
        .filter(
            meal_service__service_date=today,
            status=MealRedemption.Status.SUCCESS,
        )
        .values_list(
            "meal_service_id",
            flat=True,
        )
    )

    for service in meal_services:
        service.is_redeemed = (
            service.id in redeemed_service_ids
        )

    # ==========================================================
    # TODAY'S MEAL TOKENS
    # ==========================================================

    meal_tokens = (
        MealToken.objects
        .filter(
            student=student,
            meal_service__service_date=today,
            meal_service__university=student.university,
        )
        .select_related(
            "meal_service",
            "meal_service__meal",
        )
        .order_by(
            "meal_service__starts_at",
        )
    )

    # ==========================================================
    # CURRENT MEAL SERVICE
    # ==========================================================
    #
    # Find the meal service that is actually active RIGHT NOW.
    #
    # Example:
    #
    # 12:30 -> 16:30
    #       ↓
    # Lunch MealService
    #
    # 18:30 -> 22:30
    #       ↓
    # Dinner/Saapa MealService
    #
    # ==========================================================

    current_meal_service = (
        meal_services
        .filter(
            starts_at__lte=now,
            expires_at__gt=now,
            is_active=True,
        )
        .first()
    )

    # ==========================================================
    # CURRENT MEAL TOKEN
    # ==========================================================
    #
    # IMPORTANT:
    #
    # We get the token belonging to the CURRENT MealService.
    #
    # Therefore:
    #
    # Lunch scanner:
    #     Lunch QR
    #         ↓
    #     Lunch MealToken
    #         ↓
    #     Lunch MealService
    #
    # Saapa scanner:
    #     Saapa QR
    #         ↓
    #     Saapa MealToken
    #         ↓
    #     Saapa MealService
    #
    # They do NOT need to have the same token.
    # ==========================================================

    current_meal_token = None

    if current_meal_service is not None:
        current_meal_token = (
            meal_tokens
            .filter(
                meal_service=current_meal_service,
                is_used=False,
            )
            .first()
        )

    # ==========================================================
    # CONTEXT
    # ==========================================================

    context = {
        "student": student,
        "meal_card": meal_card,

        # Today's services
        "meal_services": meal_services,

        # All of today's tokens
        "meal_tokens": meal_tokens,

        # Token for the meal currently being served
        "current_meal_token": current_meal_token,

        # Current service
        "current_meal_service": current_meal_service,

        # Latest 10 redemptions
        "redemptions": redemptions[:10],

        "successful_redemptions": successful_redemptions,
        "today_redemptions": today_redemptions,
        "total_redemptions": total_redemptions,
    }

    # ==========================================================
    # RENDER
    # ==========================================================

    return render(
        request,
        "students/dashboard.html",
        context,
    )




from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def student_profile(request):

    student = request.user.student_profile

    return render(
        request,
        "students/profile.html",
        {
            "student": student,
        },
    )


@login_required
def student_notifications(request):

    student = request.user.student_profile

    return render(
        request,
        "students/notifications.html",
        {
            "student": student,
        },
    )


@login_required
def student_history(request):

    student = request.user.student_profile

    redemptions = (
        MealRedemption.objects
        .filter(
            student=student,
        )
        .select_related(
            "meal_service",
            "meal_service__meal",
        )
        .order_by("-redeemed_at")
    )

    return render(
        request,
        "students/history.html",
        {
            "student": student,
            "redemptions": redemptions,
        },
    )


@login_required
def student_schedule(request):

    student = request.user.student_profile

    today = timezone.localdate()

    meal_services = (
        MealService.objects
        .filter(
            university=student.university,
            service_date__gte=today,
        )
        .select_related("meal")
        .order_by(
            "service_date",
            "starts_at",
        )
    )

    return render(
        request,
        "students/schedule.html",
        {
            "student": student,
            "meal_services": meal_services,
        },
    )




@login_required
def student_help(request):

    student = request.user.student_profile

    return render(
        request,
        "students/help.html",
        {
            "student": student,
        },
    )


@login_required
def student_settings(request):

    student = request.user.student_profile

    return render(
        request,
        "students/settings.html",
        {
            "student": student,
        },
    )

