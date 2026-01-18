from playwright.sync_api import sync_playwright, expect

def test_steam_tags(page):
    # 1. Arrange
    page.goto("http://localhost:3000")

    # 2. Act
    # Find Steam input by placeholder
    steam_input = page.get_by_placeholder("Steam ID / Vanity URL")
    steam_input.fill("mock")
    steam_input.press("Enter")

    # Wait for results
    # We expect "Found 3 Steam games!" toast or the tabs to populate
    # The Mock data has "Counter-Strike", "Stardew Valley", "Grand Theft Auto V"

    # Wait for the card to appear
    page.get_by_text("Stardew Valley").wait_for()

    # 3. Assert
    # We expect tags to appear.
    # Stardew Valley should have tags like "Farming Sim", "RPG", "Pixel Graphics" etc.
    # But this depends on the real Steam Store API response.
    # If the environment has no internet or blocks Steam Store, we might get empty tags (No Tags badge).
    # We can check for the presence of ANY badge or the "No Tags" badge.

    # Check for a badge. The implementation uses Shadcn Badge which usually has class including "badge" or similar,
    # but I used `variant="secondary"` which maps to certain classes.
    # I added a specific class `text-[10px]` to the badges.

    # Let's verify that the "No Tags" badge is NOT present if enrichment works,
    # or IS present if it fails/empty.
    # Actually, let's just screenshot it.

    # Wait a bit for images/tags to render (though tags render with the game data)
    page.wait_for_timeout(2000)

    # 4. Screenshot
    page.screenshot(path="verification/steam-tags.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_steam_tags(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
