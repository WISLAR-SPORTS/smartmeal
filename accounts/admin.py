
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "university",
        "phone",
        "is_active",
        "is_staff",
    )

    list_filter = (
        "role",
        "university",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
        "phone",
        "university__name",
    )

    ordering = ("username",)

    fieldsets = UserAdmin.fieldsets + (
        (
            "SmartMeal Information",
            {
                "fields": (
                    "role",
                    "university",
                    "phone",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "SmartMeal Information",
            {
                "fields": (
                    "role",
                    "university",
                    "phone",
                )
            },
        ),
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

