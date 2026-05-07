import smtplib
from email.message import EmailMessage
from core.config import settings


def send_verification_email(to_email: str, first_name: str, token: str) -> None:
    verify_url = f"{settings.frontend_url}/verify?token={token}"

    msg = EmailMessage()
    msg["Subject"] = "Verify your MyVisaAssistant account"
    msg["From"] = f"MyVisaAssistant <{settings.email_user}>"
    msg["To"] = to_email

    msg.set_content(
        f"""
Welcome, {first_name}!

Please verify your email address by opening this link:
{verify_url}

This link expires in 24 hours.

If you didn't create an account, you can ignore this email.
"""
    )

    msg.add_alternative(
        f"""
        <h2>Welcome, {first_name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="{verify_url}" style="
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
        ">Verify Email</a>
        <p>This link expires in <strong>24 hours</strong>.</p>
        <p>If you didn't create an account, you can ignore this email.</p>
        """,
        subtype="html",
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.email_user, settings.email_app_password)
        server.send_message(msg)