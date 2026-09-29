
from django.urls import path

from . import views


app_name = "meals"


urlpatterns = [

    path(
        "scanner/",
        views.scanner_page,
        name="scanner",
    ),

    path(
        "api/redeem/",
        views.redeem_meal_view,
        name="redeem_meal",
    ),

    path(
        "redemptions/",
        views.redemption_history,
        name="redemption_history",
    ),
]

