
from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import (
    MealRedemption,
    MealScanLog,
    MealToken,
)

from django.db import transaction
from django.utils import timezone

from .models import (
    MealToken,
    MealRedemption,
    MealScanLog,
)


def redeem_meal(
    *,
    token,
    scanned_by,
):
    """
    Redeem a meal using a temporary MealToken.

    The MealToken is the student's authorization to receive
    the meal.

    One MealToken can only be redeemed once.

    One student can only redeem one time for one MealService.
    """

    now = timezone.localtime()

    # ==========================================================
    # FIND AND LOCK TOKEN
    # ==========================================================

    try:

        with transaction.atomic():

            meal_token = (
                MealToken.objects
                .select_for_update()
                .select_related(
                    "student",
                    "student__university",
                    "meal_service",
                    "meal_service__meal",
                    "meal_service__university",
                )
                .get(
                    token=token,
                )
            )

            student = meal_token.student
            meal_service = meal_token.meal_service

            # ==================================================
            # CHECK TOKEN ALREADY USED
            # ==================================================

            if meal_token.is_used:

                MealScanLog.objects.create(
                    meal_token=meal_token,
                    meal_service=meal_service,
                    scanned_by=scanned_by,
                    result=(
                        MealScanLog.Result.ALREADY_REDEEMED
                    ),
                    message=(
                        "This meal token has already "
                        "been redeemed."
                    ),
                )

                return {
                    "success": False,
                    "result": (
                        MealScanLog.Result.ALREADY_REDEEMED
                    ),
                    "message": (
                        "This meal token has already "
                        "been used."
                    ),
                }

            # ==================================================
            # CHECK EXISTING REDEMPTION
            # ==================================================
            #
            # This protects against a redemption existing even
            # if is_used was not updated correctly.
            #
            # Your database also has:
            #
            # one_redemption_per_student_per_service
            #
            # ==================================================

            already_redeemed = (
                MealRedemption.objects
                .filter(
                    student=student,
                    meal_service=meal_service,
                    status=MealRedemption.Status.SUCCESS,
                )
                .exists()
            )

            if already_redeemed:

                # Keep the token state consistent.
                meal_token.is_used = True

                if not meal_token.used_at:
                    meal_token.used_at = now

                meal_token.save(
                    update_fields=[
                        "is_used",
                        "used_at",
                    ]
                )

                MealScanLog.objects.create(
                    meal_token=meal_token,
                    meal_service=meal_service,
                    scanned_by=scanned_by,
                    result=(
                        MealScanLog.Result.ALREADY_REDEEMED
                    ),
                    message=(
                        "Student already redeemed "
                        "this meal service."
                    ),
                )

                return {
                    "success": False,
                    "result": (
                        MealScanLog.Result.ALREADY_REDEEMED
                    ),
                    "message": (
                        "This student has already "
                        "received this meal."
                    ),
                }

            # ==================================================
            # CHECK MEAL SERVICE ACTIVE
            # ==================================================

            if not meal_service.is_active:

                MealScanLog.objects.create(
                    meal_token=meal_token,
                    meal_service=meal_service,
                    scanned_by=scanned_by,
                    result=MealScanLog.Result.INVALID_MEAL,
                    message="Meal service is inactive.",
                )

                return {
                    "success": False,
                    "result": MealScanLog.Result.INVALID_MEAL,
                    "message": "Meal service is inactive.",
                }

            # ==================================================
            # CHECK MEAL STARTED
            # ==================================================

            if now < meal_service.starts_at:

                MealScanLog.objects.create(
                    meal_token=meal_token,
                    meal_service=meal_service,
                    scanned_by=scanned_by,
                    result=MealScanLog.Result.INVALID_MEAL,
                    message=(
                        "This meal service has not "
                        "started yet."
                    ),
                )

                return {
                    "success": False,
                    "result": MealScanLog.Result.INVALID_MEAL,
                    "message": (
                        "This meal service has not "
                        "started yet."
                    ),
                }

            # ==================================================
            # CHECK MEAL SERVICE EXPIRATION
            # ==================================================

            if now >= meal_service.expires_at:

                MealScanLog.objects.create(
                    meal_token=meal_token,
                    meal_service=meal_service,
                    scanned_by=scanned_by,
                    result=MealScanLog.Result.EXPIRED_TOKEN,
                    message="Meal token has expired.",
                )

                return {
                    "success": False,
                    "result": MealScanLog.Result.EXPIRED_TOKEN,
                    "message": (
                        "This meal token has expired."
                    ),
                }

            # ==================================================
            # CHECK STUDENT ACTIVE
            # ==================================================

            if not student.is_active:

                MealScanLog.objects.create(
                    meal_token=meal_token,
                    meal_service=meal_service,
                    scanned_by=scanned_by,
                    result=(
                        MealScanLog.Result.INACTIVE_STUDENT
                    ),
                    message="Student account is inactive.",
                )

                return {
                    "success": False,
                    "result": (
                        MealScanLog.Result.INACTIVE_STUDENT
                    ),
                    "message": (
                        "Student account is inactive."
                    ),
                }

            # ==================================================
            # CHECK UNIVERSITY
            # ==================================================

            if (
                student.university_id
                != meal_service.university_id
            ):

                MealScanLog.objects.create(
                    meal_token=meal_token,
                    meal_service=meal_service,
                    scanned_by=scanned_by,
                    result=(
                        MealScanLog.Result.WRONG_UNIVERSITY
                    ),
                    message=(
                        "Student does not belong "
                        "to this university."
                    ),
                )

                return {
                    "success": False,
                    "result": (
                        MealScanLog.Result.WRONG_UNIVERSITY
                    ),
                    "message": (
                        "Student does not belong "
                        "to this university."
                    ),
                }

            # ==================================================
            # CREATE REDEMPTION
            # ==================================================
            #
            # At this point:
            #
            # - token exists
            # - token is unused
            # - meal service is active
            # - meal has started
            # - meal has not expired
            # - student is active
            # - university matches
            # - student has not redeemed this service
            #
            # ==================================================

            redemption = MealRedemption.objects.create(
                student=student,
                meal_token=meal_token,
                meal_card=None,
                meal_service=meal_service,
                status=MealRedemption.Status.SUCCESS,
                scanned_by=scanned_by,
            )

            # ==================================================
            # MARK TOKEN USED
            # ==================================================

            meal_token.is_used = True
            meal_token.used_at = now

            meal_token.save(
                update_fields=[
                    "is_used",
                    "used_at",
                ]
            )

            # ==================================================
            # SUCCESS LOG
            # ==================================================

            MealScanLog.objects.create(
                meal_token=meal_token,
                meal_service=meal_service,
                scanned_by=scanned_by,
                result=MealScanLog.Result.SUCCESS,
                message="Meal redeemed successfully.",
            )

            # ==================================================
            # RESPONSE
            # ==================================================

            return {
                "success": True,
                "result": MealScanLog.Result.SUCCESS,
                "message": "Meal redeemed successfully.",

                "token": {
                    "id": meal_token.id,
                    "used": meal_token.is_used,
                    "used_at": (
                        meal_token.used_at.isoformat()
                        if meal_token.used_at
                        else None
                    ),
                },

                "redemption_id": redemption.id,

                "student": {
                    "id": student.id,
                    "name": str(student),
                    "student_id": student.student_id,
                },

                "meal": {
                    "id": meal_service.meal.id,
                    "name": meal_service.meal.name,
                    "type": (
                        meal_service.meal
                        .get_meal_type_display()
                    ),
                },

                "meal_service": {
                    "id": meal_service.id,
                    "date": (
                        meal_service.service_date.isoformat()
                    ),
                    "starts_at": (
                        meal_service.starts_at.isoformat()
                    ),
                    "expires_at": (
                        meal_service.expires_at.isoformat()
                    ),
                },

                "redeemed_at": (
                    redemption.redeemed_at.isoformat()
                ),
            }

    # ==========================================================
    # INVALID TOKEN
    # ==========================================================

    except MealToken.DoesNotExist:

        MealScanLog.objects.create(
            scanned_by=scanned_by,
            result=MealScanLog.Result.INVALID_TOKEN,
            message=(
                "QR code does not contain "
                "a valid meal token."
            ),
        )

        return {
            "success": False,
            "result": MealScanLog.Result.INVALID_TOKEN,
            "message": "Invalid or unknown meal token.",
        }

