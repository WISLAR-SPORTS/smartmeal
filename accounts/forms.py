
from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm

from .models import User
from students.models import Student, University
from django.contrib.auth.forms import PasswordChangeForm

from students.models import Student


from django import forms

from accounts.models import User
from students.models import Student


from django import forms
from django.contrib.auth.forms import PasswordChangeForm


class StudentPasswordChangeForm(PasswordChangeForm):

    old_password = forms.CharField(
        label="Current password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-input",
                "placeholder": "Current password",
                "autocomplete": "current-password",
            }
        ),
    )

    new_password1 = forms.CharField(
        label="New password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-input",
                "placeholder": "New password",
                "autocomplete": "new-password",
            }
        ),
    )

    new_password2 = forms.CharField(
        label="Confirm new password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-input",
                "placeholder": "Confirm new password",
                "autocomplete": "new-password",
            }
        ),
    )



class StudentRegistrationForm(forms.ModelForm):

    student_id = forms.CharField(
        label="Student ID",
        max_length=100,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "Student ID",
                "autocomplete": "off",
            }
        ),
    )

    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "placeholder": "Password",
                "autocomplete": "new-password",
            }
        ),
    )

    password_confirm = forms.CharField(
        label="Confirm password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "placeholder": "Confirm password",
                "autocomplete": "new-password",
            }
        ),
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "university",
        ]

        widgets = {
            "username": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Username",
                    "autocomplete": "username",
                }
            ),

            "email": forms.EmailInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Email address",
                    "autocomplete": "email",
                }
            ),

            "university": forms.Select(
                attrs={
                    "class": "form-control",
                }
            ),
        }

    def clean_student_id(self):
        student_id = self.cleaned_data["student_id"].strip()

        if Student.objects.filter(
            student_id=student_id
        ).exists():

            raise forms.ValidationError(
                "A student with this Student ID already exists."
            )

        return student_id

    def clean(self):
        cleaned_data = super().clean()

        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get(
            "password_confirm"
        )

        if (
            password
            and password_confirm
            and password != password_confirm
        ):
            self.add_error(
                "password_confirm",
                "Passwords do not match.",
            )

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)

        # Never trust role from browser.
        user.role = User.Role.STUDENT

        # Hash password.
        user.set_password(
            self.cleaned_data["password"]
        )

        if commit:
            user.save()

        return user





class StudentProfileForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = [
             "first_name",
            "last_name",
            "email",
            "phone",
            "student_id",
            "faculty",
            "course",
            "year_of_study",
            "photo",
        ]

        widgets = {
              "first_name": forms.TextInput(
                            attrs={
                                "class": "form-control",
                                "placeholder": "your first name",
                            }
                        ),
            "last_name": forms.TextInput(
                            attrs={
                                "class": "form-control",
                                "placeholder": "your last name",
                            }
                        ),
            "email": forms.TextInput(
                                            attrs={
                                                "class": "form-control",
                                                "placeholder": "your email",
                                            }
                                        ),
            "phone": forms.TextInput(
                                        attrs={
                                            "class": "form-control",
                                            "placeholder": "your phone number",
                                        }
                                    ),
            "student_id": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "e.g KU012342029",
                }
            ),
            "faculty": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Faculty",
                }
            ),
            "course": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Course",
                }
            ),
            "year_of_study": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Year of study",
                    "min": 1,
                }
            ),
            "photo": forms.FileInput(
                attrs={
                    "accept": "image/jpeg,image/png,image/webp",
                }
            ),
        }


class LoginForm(forms.Form):
    username = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "Username",
                "autocomplete": "username",
            }
        )
    )

    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "placeholder": "Password",
                "autocomplete": "current-password",
            }
        )
    )

    def __init__(self, request=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.request = request
        self.user_cache = None

    def clean(self):
        cleaned_data = super().clean()

        username = cleaned_data.get("username")
        password = cleaned_data.get("password")

        if username and password:
            self.user_cache = authenticate(
                self.request,
                username=username,
                password=password,
            )

            if self.user_cache is None:
                raise forms.ValidationError(
                    "Invalid username or password."
                )

            if not self.user_cache.is_active:
                raise forms.ValidationError(
                    "This account is inactive."
                )

        return cleaned_data

    def get_user(self):
        return self.user_cache

