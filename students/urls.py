
from django.urls import path

from . import views


app_name = "students"


urlpatterns = [
    path(
        "dashboard/",
        views.student_dashboard,
        name="dashboard",
    ),
    path("", views.landing, name="landing"),

        path(
        "profile/",
        views.student_profile,
        name="student_profile",
    ),

    path(
        "notifications/",
        views.student_notifications,
        name="student_notifications",
    ),

    path(
        "history/",
        views.student_history,
        name="student_history",
    ),

    path(
        "schedule/",
        views.student_schedule,
        name="student_schedule",
    ),

    path(
        "help/",
        views.student_help,
        name="student_help",
    ),

    path(
        "settings/",
        views.student_settings,
        name="student_settings",
    ),

]

