
from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
     path(
        "profile/edit/",
        views.student_edit_profile,
        name="student_edit_profile",
    ),
    path(
        "change-password/",
        views.student_change_password,
        name="student_change_password",
    ),
]
