
from django.contrib import messages
from django.contrib.auth import login, logout
from django.db import transaction
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import PasswordChangeView
from django.shortcuts import redirect, render

from .forms import StudentPasswordChangeForm, StudentProfileForm
from students.models import Student
from django.shortcuts import redirect, render

from .forms import (
    LoginForm,
    StudentProfileForm,
    StudentRegistrationForm,
)
from students.models import Student

def register(request):

    if request.user.is_authenticated:
        return redirect("student_dashboard")

    if request.method == "POST":

        form = StudentRegistrationForm(request.POST)

        if form.is_valid():

            with transaction.atomic():

                # ==========================================
                # CREATE USER
                # ==========================================

                user = form.save()

                # ==========================================
                # CREATE STUDENT PROFILE
                # ==========================================

                student = Student.objects.create(
                    user=user,
                    student_id=form.cleaned_data[
                        "student_id"
                    ],
                    university=user.university,
                    email=user.email,
                )

            # ==============================================
            # LOGIN
            # ==============================================

            login(request, user)

            messages.success(
                request,
                "Registration successful. Welcome!",
            )

            return redirect("students:dashboard")

    else:
        form = StudentRegistrationForm()

    context = {
        "form": form,
    }

    return render(
        request,
        "students/register.html",
        context,
    )



from django.contrib import messages
from django.contrib.auth import login
from django.shortcuts import redirect, render

from .forms import LoginForm
from .models import User


def login_view(request):

    if request.user.is_authenticated:

        if request.user.is_staff:
            return redirect("/admin/")

        return redirect_user_by_role(request.user)


    form = LoginForm(
        request=request,
        data=request.POST or None,
    )


    if request.method == "POST":

        if form.is_valid():

            user = form.get_user()

            login(request, user)

            messages.success(
                request,
                f"Welcome back, {user.get_full_name() or user.username}!",
            )

            # Django staff users go to Django Admin
            if user.is_staff:
                return redirect("/admin/")

            # Everyone else goes according to their role
            return redirect_user_by_role(user)


    return render(
        request,
        "students/login.html",
        {
            "form": form,
        },
    )


def redirect_user_by_role(user):

    if user.role == User.Role.UNIVERSITY_ADMIN:
        return redirect("university_admin_dashboard")

    if user.role == User.Role.KITCHEN_STAFF:
        return redirect("kitchen_staff_dashboard")

    if user.role == User.Role.STUDENT:
        return redirect("students:dashboard")

    return redirect("login")



def logout_view(request):
    logout(request)
    return redirect("accounts:login")


@login_required
def student_change_password(request):
    if request.method == "POST":
        form = StudentPasswordChangeForm(
            request.user,
            request.POST,
        )

        if form.is_valid():

            user = form.save()

            # Prevent the user from being logged out
            # after changing their password.
            update_session_auth_hash(
                request,
                user,
            )

            messages.success(
                request,
                "Your password has been changed successfully.",
            )

            return redirect(
                "accounts:student_settings"
            )

    else:
        form = StudentPasswordChangeForm(
            request.user
        )

    return render(
        request,
        "students/change_password.html",
        {
            "form": form,
        },
    )


@login_required
def student_edit_profile(request):
    student = request.user.student_profile

    if request.method == "POST":
        form = StudentProfileForm(
            request.POST,
            request.FILES,
            instance=student,
        )

        if form.is_valid():
            form.save()

            messages.success(
                request,
                "Your profile has been updated successfully.",
            )

            return redirect(
                "accounts:student_profile"
            )

    else:
        form = StudentProfileForm(
            instance=student
        )

    return render(
        request,
        "students/edit_profile.html",
        {
            "student": student,
            "form": form,
        },
    )
