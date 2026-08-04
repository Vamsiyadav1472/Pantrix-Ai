import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_email(to_email: str, subject: str, body: str):
    # Retrieve SMTP settings from .env
    smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("MAIL_PORT", 587))
    smtp_user = os.getenv("MAIL_USERNAME")
    smtp_password = os.getenv("MAIL_PASSWORD")
    mail_from = os.getenv("MAIL_FROM", smtp_user)

    if not smtp_user or not smtp_password:
        print("Skipping email send: SMTP credentials not set in .env")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = mail_from
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.starttls()
            
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"CRITICAL: Failed to send email (check .env): {e}")
        return False

def send_verification_code(email: str, code: str, reason: str = "signup"):
    print(f"DEBUG: Verification code for {email} is: {code} (Reason: {reason})") # Print to terminal for testing
    
    if reason == "forgot_password":
        subject = "PantrixAI - Password Reset Request"
        body = f"""Dear User,

We received a request to reset the password for your PantrixAI account. 

Your verification code is: {code}

Please enter this code in the app to proceed with resetting your password. This code will expire shortly.
If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The PantrixAI Team"""
    else:
        subject = "PantrixAI - Welcome! Verify your email"
        body = f"""Welcome to PantrixAI!

To complete your sign up and verify your account, please use the following verification code:

Verification Code: {code}

Enter this code in the app to get started with your new account. We're excited to have you on board!
If you did not sign up for a PantrixAI account, please ignore this email.

Best regards,
The PantrixAI Team"""

    return send_email(email, subject, body)
