
from django.contrib import admin

from .models import University, Student, MealCard


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "code",
        "email",
        "phone",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "code",
        "email",
        "phone",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "name",
    )


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):

    list_display = (
        "student_id",
        "first_name",
        "last_name",
        "university",
        "faculty",
        "course",
        "year_of_study",
        "is_active",
    )

    list_filter = (
        "university",
        "faculty",
        "year_of_study",
        "is_active",
    )

    search_fields = (
        "student_id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "faculty",
        "course",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "last_name",
        "first_name",
    )


@admin.register(MealCard)
class MealCardAdmin(admin.ModelAdmin):

    list_display = (
        "card_number",
        "student",
        "status",
        "issued_at",
        "expires_at",
    )

    list_filter = (
        "status",
        "issued_at",
    )

    search_fields = (
        "card_number",
        "qr_token",
        "student__student_id",
        "student__first_name",
        "student__last_name",
        "student__email",
    )

    readonly_fields = (
        "qr_token",
        "qr_code",
        "issued_at",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-issued_at",
    )

