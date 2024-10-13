from fastapi_mail import MessageSchema
from app import fast_mail

async def send_email(subject: str, recipients: list, body: str):
    """
    Utility function to send an email using FastAPI-Mail.
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )
    await fast_mail.send_message(message)

async def send_otp_email(email: str, otp: str):
    """
    Sends an OTP email using FastAPI-Mail.
    """
    subject = "Your OTP Code"
    message_body = f"Your OTP code is: {otp}. It is valid for 5 minutes."

    try:
        # Send the email using the send_email utility
        await send_email(subject, [email], message_body)
        print(f"OTP email sent successfully to {email}.")
    except Exception as e:
        print(f"Error sending email: {e}")
