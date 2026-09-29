
from django.db import models
from accounts.models import User
import secrets


class University(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)

    address = models.TextField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)

    logo = models.ImageField(
        upload_to="universities/logos/",
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Student(models.Model):
    user = models.OneToOneField(
        "accounts.User",  # change app name if necessary
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="students",
    )

    student_id = models.CharField(max_length=50)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)

    faculty = models.CharField(max_length=150, blank=True)
    course = models.CharField(max_length=150, blank=True)
    year_of_study = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    photo = models.ImageField(
        upload_to="students/photos/",
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["university", "student_id"],
                name="unique_student_id_per_university",
            )
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class MealCard(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        BLOCKED = "blocked", "Blocked"
        EXPIRED = "expired", "Expired"

    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name="meal_card",
    )

    card_number = models.CharField(
        max_length=100,
        unique=True,
    )

    # Random secure token stored in the QR code.
    qr_token = models.CharField(
    max_length=255,
    unique=True,
    default=secrets.token_urlsafe,
    editable=False,
)

    qr_code = models.ImageField(
        upload_to="meal_cards/qr/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.card_number} - {self.student}"

