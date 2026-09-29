
from datetime import datetime, time

from django.db import transaction
from django.utils import timezone

from .models import Meal, MealService, MealToken
from students.models import University, Student


# ============================================================
# MEAL TIME HELPERS
# ============================================================

def get_current_meal_type(current_time=None):
    """
    Determine which meal is currently active.

    Schedule:

        Lunch:
            12:00 AM -> 4:30 PM

        Dinner / Saapa:
            4:31 PM -> 11:59:59 PM

    Returns:
        Meal.MealType.LUNCH
        Meal.MealType.DINNER
        None
    """

    if current_time is None:
        current_time = timezone.localtime().time()

    # Lunch
    if time(0, 0) <= current_time <= time(16, 30):
        return Meal.MealType.LUNCH

    # Dinner / Saapa
    if time(16, 31) <= current_time <= time(23, 59, 59):
        return Meal.MealType.DINNER

    return None


def get_meal_times(service_date, meal_type):
    """
    Return timezone-aware start and expiration datetimes
    for a meal service.

    Uses the Django project timezone, which should be:

        TIME_ZONE = "Africa/Kampala"
        USE_TZ = True
    """

    tz = timezone.get_current_timezone()

    if meal_type == Meal.MealType.LUNCH:

        start_time = time(0, 0)
        end_time = time(16, 30)

    elif meal_type == Meal.MealType.DINNER:

        start_time = time(16, 31)
        end_time = time(23, 59, 59)

    else:
        raise ValueError(
            f"Unknown meal type: {meal_type}"
        )

    starts_at = timezone.make_aware(
        datetime.combine(
            service_date,
            start_time,
        ),
        timezone=tz,
    )

    expires_at = timezone.make_aware(
        datetime.combine(
            service_date,
            end_time,
        ),
        timezone=tz,
    )

    return starts_at, expires_at


def get_meal_expiration(service_date, meal_type):
    """
    Return the exact expiration datetime for a meal.
    """

    _, expires_at = get_meal_times(
        service_date,
        meal_type,
    )

    return expires_at


# ============================================================
# TOKEN GENERATION
# ============================================================

def generate_tokens_for_meal_service(meal_service):
    """
    Generate one MealToken for every eligible student
    belonging to the university.

    This function is safe to call repeatedly as long as
    MealToken has a unique constraint on:

        student + meal_service
    """

    students = Student.objects.filter(
        university=meal_service.university,
        is_active=True,
    )

    tokens_created = 0

    for student in students:

        token, created = MealToken.objects.get_or_create(
            student=student,
            meal_service=meal_service,
        )

        if created:
            tokens_created += 1

    return tokens_created


# ============================================================
# MEAL SERVICE GENERATION
# ============================================================

@transaction.atomic
def generate_meal_service(
    university,
    meal_type,
    service_date,
):
    """
    Get or create a MealService for a university,
    meal type and service date.

    Calling this function multiple times does NOT create
    duplicate MealServices.

    Student tokens are generated only when the MealService
    is created for the first time.
    """

    # Find the active Meal record for this meal type.
    meal = Meal.objects.get(
        meal_type=meal_type,
        is_active=True,
    )

    starts_at, expires_at = get_meal_times(
        service_date=service_date,
        meal_type=meal_type,
    )

    # Because MealService has a database uniqueness constraint:
    #
    # meal + university + service_date
    #
    # this will return the existing service if one already exists.
    meal_service, created = MealService.objects.get_or_create(
        meal=meal,
        university=university,
        service_date=service_date,
        defaults={
            "starts_at": starts_at,
            "expires_at": expires_at,
            "is_active": True,
        },
    )

    # Only create tokens when the MealService is created.
    if created:

        generate_tokens_for_meal_service(
            meal_service=meal_service,
        )

    return meal_service


# ============================================================
# GENERATE MEAL FOR ALL UNIVERSITIES
# ============================================================

def generate_meals_for_all_universities(
    meal_type,
    service_date=None,
):
    """
    Generate the specified meal for every active university.

    Example:

        generate_meals_for_all_universities(
            meal_type=Meal.MealType.LUNCH,
            service_date=today,
        )

    Safe to call repeatedly.
    Existing MealServices will not be duplicated.
    """

    if service_date is None:
        service_date = timezone.localdate()

    universities = University.objects.filter(
        is_active=True,
    )

    results = []

    for university in universities:

        try:

            meal_service = generate_meal_service(
                university=university,
                meal_type=meal_type,
                service_date=service_date,
            )

            results.append(meal_service)

        except Exception as exc:

            print(
                f"Could not generate "
                f"{meal_type} for "
                f"{university}: {exc}"
            )

    return results


# ============================================================
# GET TODAY'S ACTIVE MEAL SERVICES
# ============================================================

def get_today_meal_services():
    """
    Return today's active MealServices.

    Only services belonging to active meals and active
    universities are returned.
    """

    today = timezone.localdate()

    return (
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


# ============================================================
# TOKEN VALIDATION
# ============================================================

def is_meal_token_valid(token):
    """
    Determine whether a MealToken is currently valid.

    A token is invalid if:

        - it has already been used
        - its MealService is inactive
        - the MealService has expired
        - the current time is before the MealService starts
    """

    now = timezone.now()

    meal_service = token.meal_service

    if token.is_used:
        return False

    if not meal_service.is_active:
        return False

    if now < meal_service.starts_at:
        return False

    if now >= meal_service.expires_at:
        return False

    return True

