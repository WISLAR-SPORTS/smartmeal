
from django.urls import path

from . import views


app_name = "kitchen"

urlpatterns = [
    path(
        "qr-scanner/",
        views.qr_scanner,
        name="qr_scanner",
    ),
    path(
        "verify-qr/",
        views.verify_qr,
        name="verify_qr",
    ),
]

