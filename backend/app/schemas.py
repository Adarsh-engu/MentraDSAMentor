from pydantic import BaseModel, UUID4, EmailStr
from datetime import datetime, date

class UserProfileUpdate(BaseModel):
    name: str | None = None
    college: str | None = None
    dob: date | None = None
    summary: str | None = None

class UserProfileResponse(BaseModel):
    id: UUID4
    name: str | None = None
    email: str | None = None
    image: str | None = None
    college: str | None = None
    dob: date | None = None
    summary: str | None = None

    class Config:
        from_attributes = True

class PlatformResponse(BaseModel):
    id: UUID4
    name: str
    base_url: str

    class Config:
        from_attributes = True

class UserPlatformCreate(BaseModel):
    platform_id: UUID4
    handle: str
    auth_token: str | None = None

class UserPlatformResponse(BaseModel):
    id: UUID4
    platform: PlatformResponse
    handle: str
    auth_token: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProblemResponse(BaseModel):
    id: UUID4
    platform_id: UUID4
    platform_problem_id: str
    title: str
    difficulty: str | None = None
    url: str | None = None

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    problem: ProblemResponse
    status: str
    language: str | None = None
    submitted_at: datetime
    runtime_ms: int | None = None
    memory_kb: int | None = None

    class Config:
        from_attributes = True

class PaginatedSubmissions(BaseModel):
    items: list[SubmissionResponse]
    total: int
    page: int
    size: int

class HeatmapData(BaseModel):
    date: str
    count: int

class PlatformStat(BaseModel):
    name: str
    count: int

class DashboardStatsResponse(BaseModel):
    total_submissions: int
    total_accepted: int
    heatmap: list[HeatmapData]
    platform_distribution: list[PlatformStat]

class ChatMessage(BaseModel):
    message: str

class AiMentorChatRequest(BaseModel):
    problem_id: str
    message: str
    history: list[dict[str, str]] = []

class RadarData(BaseModel):
    subject: str
    A: int
    fullMark: int

class LineData(BaseModel):
    time: str
    load: int

class DifficultyStats(BaseModel):
    Easy: int
    Medium: int
    Hard: int

class AnalyticsResponse(BaseModel):
    radar_data: list[RadarData]
    line_data: list[LineData]
    difficulty_distribution: DifficultyStats
    total_unique_problems: int
    current_streak: int
    total_accepted: int
    mastery_score: int
