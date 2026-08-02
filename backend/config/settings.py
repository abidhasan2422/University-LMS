from pathlib import Path
from decouple import config
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================
# SECURITY
# ==========================
SECRET_KEY = config("SECRET_KEY")

DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]


# ==========================
# APPLICATIONS
# ==========================
INSTALLED_APPS = [
    # Third Party Apps
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "drf_spectacular",

    # Django Apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "apps.users",
    "apps.authentication",
    "rest_framework_simplejwt.token_blacklist",
    "apps.departments",
    "apps.common",
    "apps.semester",
    "apps.course",
]


# ==========================
# MIDDLEWARE
# ==========================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"


# ==========================
# TEMPLATES
# ==========================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "config.wsgi.application"


# ==========================
# DATABASE
# ==========================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ==========================
# PASSWORD VALIDATION
# ==========================
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ==========================
# INTERNATIONALIZATION
# ==========================
LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Dhaka"

USE_I18N = True

USE_TZ = True


# ==========================
# STATIC & MEDIA
# ==========================
STATIC_URL = "static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ==========================
# DEFAULT PRIMARY KEY
# ==========================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ==========================
# DJANGO REST FRAMEWORK
# ==========================
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",

    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
     "DEFAULT_PAGINATION_CLASS":"apps.common.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 10,
}


# ==========================
# SWAGGER
# ==========================
SPECTACULAR_SETTINGS = {
    "TITLE": "University LMS API",
    "DESCRIPTION": "Backend API for University Learning Management System",
    "VERSION": "1.0.0",
}


# ==========================
# CORS
# ==========================
CORS_ALLOW_ALL_ORIGINS = True

# ==========================
# CUSTOM USER MODEL
# ==========================
AUTH_USER_MODEL = "users.User"

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),

    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": True,

    "BLACKLIST_AFTER_ROTATION": True,

    "UPDATE_LAST_LOGIN": True,
}
EMAIL_BACKEND = config("EMAIL_BACKEND")

EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT", cast=int)

EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")

EMAIL_USE_TLS = config("EMAIL_USE_TLS", cast=bool)

DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL")

FRONTEND_URL = config("FRONTEND_URL")