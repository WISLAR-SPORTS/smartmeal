
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.shortcuts import render

from students.models import MealCard


@staff_member_required
def qr_scanner(request):
    return render(request, "admin/kitchen/qr_scanner.html")


@staff_member_required
def verify_qr(request):
    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "message": "Invalid request method.",
            },
            status=405,
        )

    qr_token = request.POST.get("qr_token")

    if not qr_token:
        return JsonResponse(
            {
                "success": False,
                "message": "No QR code was provided.",
            },
            status=400,
        )

    try:
        meal_card = MealCard.objects.select_related(
            "student",
            "student__university",
        ).get(qr_token=qr_token)

    except MealCard.DoesNotExist:
        return JsonResponse(
            {
                "success": False,
                "message": "Invalid meal card.",
            },
            status=404,
        )

    if meal_card.status != MealCard.Status.ACTIVE:
        return JsonResponse(
            {
                "success": False,
                "message": f"Meal card is {meal_card.get_status_display().lower()}.",
            },
            status=400,
        )

    student = meal_card.student

    return JsonResponse(
        {
            "success": True,
            "message": "Meal card verified.",
            "student": {
                "name": f"{student.first_name} {student.last_name}",
                "student_id": student.student_id,
                "university": student.university.name,
            },
            "meal_card": {
                "card_number": meal_card.card_number,
                "status": meal_card.get_status_display(),
            },
        }
    )

