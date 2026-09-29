
from django.db import models
import secrets


class Meal(models.Model):

    class MealType(models.TextChoices):
        BREAKFAST = "breakfast", "Breakfast"
        LUNCH = "lunch", "Lunch"
        DINNER = "dinner", "Dinner"

    university = models.ForeignKey(
        "students.University",
        on_delete=models.PROTECT,
        related_name="meals",
    )

    name = models.CharField(
        max_length=150,
    )

    meal_type = models.CharField(
        max_length=20,
        choices=MealType.choices,
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"{self.name} "
            f"({self.get_meal_type_display()})"
        )


class MealService(models.Model):
    """
    A specific meal being served at a university
    on a specific date and during a specific time window.

    Example:

    Lunch:
        12:30 -> 16:30

    Dinner / Saapa:
        18:30 -> 22:30
    """

    meal = models.ForeignKey(
        Meal,
        on_delete=models.PROTECT,
        related_name="services",
    )

    university = models.ForeignKey(
        "students.University",
        on_delete=models.PROTECT,
        related_name="meal_services",
    )

    service_date = models.DateField()

    starts_at = models.DateTimeField()

    expires_at = models.DateTimeField()

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-service_date",
            "starts_at",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "meal",
                    "university",
                    "service_date",
                ],
                name="unique_meal_service_per_university_day",
            ),
        ]

    def __str__(self):
        return (
            f"{self.university} - "
            f"{self.meal} - "
            f"{self.service_date}"
        )

    @property
    def is_expired(self):
        from django.utils import timezone

        return timezone.now() >= self.expires_at

    @property
    def is_available(self):
        from django.utils import timezone

        now = timezone.now()

        return (
            self.is_active
            and self.starts_at <= now < self.expires_at
        )


class MealToken(models.Model):
    """
    One unique temporary meal token belonging to
    one student for one specific meal service.

    Example:

        Student A
            |
            └── Lunch MealToken
                    |
                    ├── 12:30 start
                    ├── 16:30 expiration
                    └── one-time use

        Student A
            |
            └── Saapa MealToken
                    |
                    ├── 18:30 start
                    ├── 22:30 expiration
                    └── one-time use
    """

    meal_service = models.ForeignKey(
        MealService,
        on_delete=models.PROTECT,
        related_name="tokens",
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.PROTECT,
        related_name="meal_tokens",
    )

    token = models.CharField(
        max_length=64,
        unique=True,
        editable=False,
    )

    is_used = models.BooleanField(
        default=False,
    )

    used_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "meal_service",
                    "student",
                ],
                name="one_token_per_student_per_meal_service",
            ),
        ]

    def save(self, *args, **kwargs):

        if not self.token:
            self.token = secrets.token_urlsafe(32)

        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return self.meal_service.is_expired

    @property
    def is_valid(self):

        return (
            not self.is_used
            and self.meal_service.is_available
        )

    def __str__(self):
        return (
            f"{self.student} - "
            f"{self.meal_service} - "
            f"{self.token}"
        )


class MealRedemption(models.Model):

    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        REJECTED = "rejected", "Rejected"

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.PROTECT,
        related_name="meal_redemptions",
    )

    meal_card = models.ForeignKey(
    "students.MealCard",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="redemptions",
)

    meal_service = models.ForeignKey(
        MealService,
        on_delete=models.PROTECT,
        related_name="redemptions",
    )

    meal_token = models.ForeignKey(
        MealToken,
        on_delete=models.PROTECT,
        related_name="redemption",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUCCESS,
    )

    redeemed_at = models.DateTimeField(
        auto_now_add=True,
    )

    scanned_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="meal_redemptions",
    )

    notes = models.TextField(
        blank=True,
    )

    class Meta:
        ordering = ["-redeemed_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "meal_service",
                ],
                name="one_redemption_per_student_per_service",
            ),

            models.UniqueConstraint(
                fields=[
                    "meal_token",
                ],
                name="one_redemption_per_meal_token",
            ),
        ]

    def __str__(self):
        return (
            f"{self.student} - "
            f"{self.meal_service} - "
            f"{self.redeemed_at}"
        )


class MealScanLog(models.Model):

    class Result(models.TextChoices):

        SUCCESS = "success", "Success"

        ALREADY_REDEEMED = (
            "already_redeemed",
            "Already Redeemed",
        )

        INVALID_CARD = (
            "invalid_card",
            "Invalid Card",
        )

        BLOCKED_CARD = (
            "blocked_card",
            "Blocked Card",
        )

        EXPIRED_CARD = (
            "expired_card",
            "Expired Card",
        )

        INVALID_TOKEN = (
            "invalid_token",
            "Invalid Token",
        )

        EXPIRED_TOKEN = (
            "expired_token",
            "Expired Token",
        )

        TOKEN_NOT_ASSIGNED = (
            "token_not_assigned",
            "Token Not Assigned To Student",
        )

        INVALID_MEAL = (
            "invalid_meal",
            "Invalid Meal",
        )

        INACTIVE_STUDENT = (
            "inactive_student",
            "Inactive Student",
        )

        WRONG_UNIVERSITY = (
            "wrong_university",
            "Wrong University",
        )

        ERROR = (
            "error",
            "Error",
        )

    meal_card = models.ForeignKey(
        "students.MealCard",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scan_logs",
    )

    meal_service = models.ForeignKey(
        MealService,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scan_logs",
    )

    meal_token = models.ForeignKey(
        MealToken,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scan_logs",
    )

    scanned_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="meal_scan_logs",
    )

    result = models.CharField(
        max_length=30,
        choices=Result.choices,
    )

    message = models.TextField(
        blank=True,
    )

    scanned_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-scanned_at"]

    def __str__(self):
        return (
            f"{self.meal_token} - "
            f"{self.result} - "
            f"{self.scanned_at}"
        )

