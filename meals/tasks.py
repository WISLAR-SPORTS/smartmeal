from celery import shared_task
from django.utils import timezone

from .models import Meal
from .services import generate_meals_for_all_universities

@shared_task
def generate_lunch_tokens():


today = timezone.localdate()

generate_meals_for_all_universities(
    meal_type=Meal.MealType.LUNCH,
    service_date=today,
)


@shared_task
def generate_saapa_tokens():


today = timezone.localdate()

generate_meals_for_all_universities(
    meal_type=Meal.MealType.DINNER,
    service_date=today,
)

