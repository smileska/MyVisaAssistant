import resend
from core.config import settings

resend.api_key = settings.resend_api_key


def send_verification_email(to_email: str, first_name: str, token: str) -> None:

    #send to frontend
    # verify_url = f"{settings.frontend_url}/verify-email?token={token}"

    #testing on backend only
    verify_url = f"http://127.0.0.1:8000/auth/verify?token={token}"

    resend.Emails.send({
        "from": "MyVisaAssistant <onboarding@resend.dev>",
        "to": to_email,
        "subject": "Verify your MyVisaAssistant account",
        "html": f"""
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
    })