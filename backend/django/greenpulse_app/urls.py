from django.urls import path
from greenpulse_app import views

urlpatterns = [
    path("api/telemetry/latest/", views.latest_telemetry, name="telemetry-latest"),
    path("api/latest/", views.latest_telemetry, name="latest-fallback"),
    path("api/nodes/", views.list_nodes, name="nodes-list"),
    path("api/alerts/", views.list_alerts, name="alerts-list"),
]
