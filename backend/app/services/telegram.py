"""
Telegram bot — outbound messages only.
Sends daily rankings, matchday-ended notifications, and prediction reminders.
"""

import logging

from telegram import Bot

from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_bot() -> Bot | None:
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not set — Telegram disabled.")
        return None
    return Bot(token=settings.TELEGRAM_BOT_TOKEN)


async def _send_message(text: str) -> None:
    bot = _get_bot()
    if bot is None or not settings.TELEGRAM_CHANNEL_ID:
        return
    async with bot:
        await bot.send_message(
            chat_id=settings.TELEGRAM_CHANNEL_ID,
            text=text,
            parse_mode="HTML",
        )


async def send_daily_ranking(leaderboard: list[dict]) -> None:
    if not leaderboard:
        return
    lines = ["<b>🏆 Daily Ranking</b>\n"]
    for entry in leaderboard[:20]:
        medal = ""
        rank = entry.get("rank", 0)
        if rank == 1:
            medal = "🥇 "
        elif rank == 2:
            medal = "🥈 "
        elif rank == 3:
            medal = "🥉 "
        lines.append(
            f"{medal}<b>{rank}.</b> {entry['display_name']} — "
            f"<b>{entry['total_points']}</b> pts"
        )
    await _send_message("\n".join(lines))


async def send_matchday_ended(matchday: int, leaderboard: list[dict]) -> None:
    lines = [f"<b>⚽ Matchday {matchday} complete!</b>\n"]
    lines.append("Updated standings:\n")
    for entry in leaderboard[:10]:
        lines.append(
            f"<b>{entry['rank']}.</b> {entry['display_name']} — "
            f"<b>{entry['total_points']}</b> pts"
        )
    await _send_message("\n".join(lines))


async def send_prediction_reminder(match_descriptions: list[str]) -> None:
    if not match_descriptions:
        return
    lines = ["<b>⏰ Prediction reminder!</b>\n"]
    lines.append("Upcoming matches — submit your picks:\n")
    for desc in match_descriptions[:10]:
        lines.append(f"• {desc}")
    await _send_message("\n".join(lines))
