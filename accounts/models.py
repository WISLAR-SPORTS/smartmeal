
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        UNIVERSITY_ADMIN = "university_admin", "University Admin"
        KITCHEN_STAFF = "kitchen_staff", "Kitchen Staff"
        STUDENT = "student", "Student"

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    university = models.ForeignKey(
        "students.University",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )

    phone = models.CharField(
        max_length=30,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.get_full_name() or self.username

