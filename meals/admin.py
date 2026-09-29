
from django.contrib import admin

from .models import (
    Meal,
    MealService,
    MealRedemption,
    MealScanLog,
)





# =========================================================
# MEAL
# =========================================================

@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "university",
        "meal_type",
        "is_active",
        "created_at",
    )

    list_filter = (
        "university",
        "meal_type",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
        "university__name",
        "university__code",
    )

    ordering = (
        "university",
        "meal_type",
        "name",
    )

    list_per_page = 25


# =========================================================
# MEAL SERVICE
# =========================================================



from django.contrib import admin, messages

from .models import (
    Meal,
    MealService,
    MealToken,
    MealRedemption,
    MealScanLog,
)


@admin.register(MealService)
class MealServiceAdmin(admin.ModelAdmin):

    list_display = (
        "meal",
        "university",
        "service_date",
        "starts_at",
        "expires_at",
        "is_active",
    )

    list_filter = (
        "meal__meal_type",
        "university",
        "service_date",
        "is_active",
    )

    search_fields = (
        "meal__name",
        "university__name",
        "university__code",
    )

    date_hierarchy = "service_date"

    ordering = (
        "-service_date",
        "starts_at",
    )

    list_per_page = 25

    autocomplete_fields = (
        "meal",
        "university",
    )

    actions = [
        "generate_student_tokens",
    ]

    @admin.action(
        description="Generate tokens for all active students"
    )
    def generate_student_tokens(
        self,
        request,
        queryset,
    ):

        total_created = 0
        total_existing = 0

        for meal_service in queryset:

            students = meal_service.university.students.filter(
                is_active=True
            )

            for student in students:

                token, created = MealToken.objects.get_or_create(
                    meal_service=meal_service,
                    student=student,
                )

                if created:
                    total_created += 1
                else:
                    total_existing += 1

        self.message_user(
            request,
            (
                f"{total_created} meal token(s) generated. "
                f"{total_existing} token(s) already existed."
            ),
            messages.SUCCESS,
        )

    class Media:

        css = {
            "all": (
                "admin/css/custom_admin.css",
            ),
        }



from django.contrib import admin, messages

from .models import (
    Meal,
    MealService,
    MealToken,
    MealRedemption,
    MealScanLog,
)

from .redemption import redeem_meal


@admin.register(MealToken)
class MealTokenAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "meal_service",
        "token_short",
        "is_used",
        "used_at",
        "created_at",
        "valid_status",
    )

    list_filter = (
        "is_used",
        "meal_service__meal__meal_type",
        "meal_service__service_date",
    )

    search_fields = (
        "token",
        "student__student_id",
    )

    readonly_fields = (
        "token",
        "created_at",
        "used_at",
    )

    ordering = (
        "-created_at",
    )

    actions = [
        "redeem_selected_tokens",
    ]

    @admin.display(
        description="Token"
    )
    def token_short(self, obj):
        if not obj.token:
            return "-"

        return f"{obj.token[:12]}..."

    @admin.display(
        boolean=True,
        description="Valid"
    )
    def valid_status(self, obj):
        return obj.is_valid

        
    @admin.action(
        description="Redeem selected meal token(s)"
    )
    def redeem_selected_tokens(
        self,
        request,
        queryset,
    ):

        for meal_token in queryset:

            result = redeem_meal(
                token=meal_token.token,
                scanned_by=request.user,
            )

            if result["success"]:

                self.message_user(
                    request,
                    (
                        f"SUCCESS: {meal_token.student} - "
                        f"{meal_token.meal_service.meal.name} "
                        f"was redeemed successfully."
                    ),
                    messages.SUCCESS,
                )

            else:

                self.message_user(
                    request,
                    (
                        f"FAILED: {meal_token.student} - "
                        f"{result.get('message', 'Unknown error')}"
                    ),
                    messages.ERROR,
                )





# =========================================================
# MEAL REDEMPTION
# =========================================================

@admin.register(MealRedemption)
class MealRedemptionAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "meal_card",
        "meal_service",
        "status",
        "redeemed_at",
        "scanned_by",
    )

    list_filter = (
        "status",
        "meal_service__meal__meal_type",
        "meal_service__university",
        "meal_service__service_date",
        "redeemed_at",
    )

    search_fields = (
        "student__student_id",
        "student__first_name",
        "student__last_name",
        "student__email",
        "meal_card__card_number",
        "meal_service__meal__name",
        "scanned_by__username",
        "scanned_by__email",
    )

    date_hierarchy = "redeemed_at"

    ordering = (
        "-redeemed_at",
    )

    list_per_page = 50

    autocomplete_fields = (
        "student",
        "meal_card",
        "meal_service",
        "scanned_by",
    )

    readonly_fields = (
        "redeemed_at",
    )


# =========================================================
# MEAL SCAN LOG
# =========================================================

@admin.register(MealScanLog)
class MealScanLogAdmin(admin.ModelAdmin):

    list_display = (
        "meal_card",
        "meal_service",
        "scanned_by",
        "result",
        "message",
        "scanned_at",
    )

    list_filter = (
        "result",
        "meal_service__university",
        "meal_service__service_date",
        "scanned_at",
    )

    search_fields = (
        "meal_card__card_number",
        "meal_service__meal__name",
        "scanned_by__username",
        "scanned_by__email",
        "message",
    )

    date_hierarchy = "scanned_at"

    ordering = (
        "-scanned_at",
    )

    list_per_page = 50

    autocomplete_fields = (
        "meal_card",
        "meal_service",
        "scanned_by",
    )

    readonly_fields = (
        "scanned_at",
    )

