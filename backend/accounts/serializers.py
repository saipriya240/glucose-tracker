
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            **validated_data
        )


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["target_low", "target_high"]

    def validate_target_low(self, value):
        if not 40 <= value <= 500:
            raise serializers.ValidationError(
                "Minimum target must be between 40 and 500 mg/dL."
            )
        return value

    def validate_target_high(self, value):
        if not 60 <= value <= 600:
            raise serializers.ValidationError(
                "Maximum target must be between 60 and 600 mg/dL."
            )
        return value

    def validate(self, attrs):
        low = attrs.get(
            "target_low",
            self.instance.target_low if self.instance else 70
        )
        high = attrs.get(
            "target_high",
            self.instance.target_high if self.instance else 180
        )

        if low >= high:
            raise serializers.ValidationError({
                "target_high": (
                    "Maximum target must be greater than minimum target."
                )
            })

        return attrs
