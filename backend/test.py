from app.models import User

def test_login(email, password):
    user = User.find_by_email(email)
    if user:
        print(f"User found: {user.full_name}")
        if user.check_password(password):
            print("Login successful")
        else:
            print("Login failed: Invalid password")
    else:
        print("Login failed: User not found")

# Test login
test_login("demouser@gmail.com", "123456")
