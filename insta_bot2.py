import asyncio
import pandas as pd
from pyppeteer import launch
from pyppeteer.errors import PageError, ElementHandleError

async def login(page):
    await page.goto("https://www.instagram.com/")
    await asyncio.sleep(2)

    if await page.querySelector("input[name='username']"):
        print("Not logged in. Performing login.")
        await page.type("input[name='username']", "ptesting422")
        await page.type("input[name='password']", "ptesting422@")
        await page.keyboard.press("Enter")
        await page.waitForNavigation()
        await asyncio.sleep(5)
    else:
        print("Already logged in.")

async def scroll_and_click_multiple_times():
    browser = await launch(headless=False,  executablePath="C:\Program Files\Google\Chrome\Application\chrome.exe")
    page = await browser.newPage()

    try:
        await login(page)

        await page.goto("https://www.instagram.com/?variant=following")
        await asyncio.sleep(10)

        like_btn_selector = ".x1lliihq.x1n2onr6.xyb1xck"
        comment_input_selector = (
            ".x1i0vuye.xvbhtw8.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x5n08af.x78zum5.x1iyjqo2.x1qlqyl8.x1d6elog.xlk1fp6.x1a2a7pz.xexx8yu.x4uap5.x18d9i69.xkhd6sd.xtt52l0.xnalus7.xs3hnx8.x1bq4at4.xaqnwrm"
        )
        post_button_selector = "._aidp"
        custom_scroll_height=300

        liked_and_commented_users = set()

        for _ in range(5):
            post_time_selector = '.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x1roi4f4.x1tu3fi.x3x7a5m.x10wh9bi.x1wdrske.x8viiok.x18hxmgj'
            post_username_selector = '._ap3a._aaco._aacw._aacx._aad7._aade'
    
            try:
                post_time_element = await page.waitForSelector(post_time_selector)
                post_time_text = await page.evaluate('(element) => element.textContent', post_time_element)
                
                post_username_element = await page.waitForSelector(post_username_selector)
                post_username_text = await page.evaluate('(element) => element.textContent', post_username_element)
                print(post_username_text)
                
                if post_time_text <= "24h":
                    if post_username_text not in liked_and_commented_users:
                        await page.waitForSelector(like_btn_selector, timeout=5000)
                        await page.click(like_btn_selector)
                        await asyncio.sleep(5)
                        
                        await page.waitForSelector(comment_input_selector)
                        await page.type(comment_input_selector, "Nice Post😊")
                        await asyncio.sleep(5)
                        
                        await page.waitForSelector(post_button_selector)
                        await page.click(post_button_selector)
                        await asyncio.sleep(5)
                        
                        # Add username to set of liked and commented users
                        liked_and_commented_users.add(post_username_text)
                else:
                    await page.evaluate(f"window.scrollBy(0, {custom_scroll_height})")
                    await asyncio.sleep(5)
                    continue
                
            except ElementHandleError as e:
                print(f"Error getting post time: {e}")
            
            await page.evaluate(f"window.scrollBy(0, {custom_scroll_height})")
            await asyncio.sleep(5)

        try:
            excel_data = pd.read_excel('profile_url.xlsx')
            profile_urls = excel_data['profile_url'].tolist()

            for profile_url in profile_urls:

                await page.goto(profile_url)
                await asyncio.sleep(7)

                post_div_selector = '._aagw'
                try:

                    await page.waitForSelector(post_div_selector, timeout=5000)
                    await page.click(post_div_selector)
                    await asyncio.sleep(7)

                    like_btn_selector = '.x1lliihq.x1n2onr6.xyb1xck'
                    await page.waitForSelector(like_btn_selector)
                    await page.click(like_btn_selector)
                    await asyncio.sleep(7)

                    nice_message_selector = '.x1i0vuye.xvbhtw8.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x5n08af.x78zum5.x1iyjqo2.x1qlqyl8.x1d6elog.xlk1fp6.x1a2a7pz.xexx8yu.x4uap5.x18d9i69.xkhd6sd.xtt52l0.xnalus7.xs3hnx8.x1bq4at4.xaqnwrm'
                    await page.waitForSelector(nice_message_selector)
                    await page.type(nice_message_selector, "Nice ")
                    await asyncio.sleep(7)

                    post_comment_selector = '._am-5'
                    await page.waitForSelector(post_comment_selector)
                    await page.click(post_comment_selector)
                    await asyncio.sleep(7)

                    close_btn_selector = '.x1lliihq.x1n2onr6.x9bdzbf'
                    await page.waitForSelector(close_btn_selector)
                    await page.click(close_btn_selector)
                    await asyncio.sleep(7)

                    message_btn_selector = '.x1i10hfl.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x972fbf.xcfux6l.x1qhh985.xm0m39n.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x18d9i69.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x9f619.x1ypdohk.x78zum5.x1f6kntn.xwhw2v2.x10w6t97.xl56j7k.x17ydfre.x1swvt13.x1pi30zi.x1n2onr6.x2b8uid.xlyipyv.x87ps6o.x14atkfc.xcdnw81.x1i0vuye.x1gjpkn9.x5n08af.xsz8vos'
                    await page.waitForSelector(message_btn_selector)
                    await page.click(message_btn_selector)
                    await asyncio.sleep(7)

                    message_btn_selector='.x1i10hfl.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x972fbf.xcfux6l.x1qhh985.xm0m39n.xdl72j9.x2lah0s.xe8uvvx.xdj266r.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x18d9i69.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x9f619.x1ypdohk.x1f6kntn.xwhw2v2.xl56j7k.x17ydfre.x2b8uid.xlyipyv.x87ps6o.x14atkfc.xcdnw81.x1i0vuye.xjbqb8w.xm3z3ea.x1x8b98j.x131883w.x16mih1h.x972fbf.xcfux6l.x1qhh985.xm0m39n.xt0psk2.xt7dq6l.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x1n5bzlp.x173jzuc.x1yc6y37.xfs2ol5'
                    try:
                        await page.waitForSelector(message_btn_selector)
                        await page.click(message_btn_selector)
                        await asyncio.sleep(7)
                    except ElementHandleError as e:
                        print(f"Error clicking on message button: {e}")

                    dm_selector = '.xi81zsa.x6ikm8r.x10wlt62.x47corl.x10l6tqk.x17qophe.xlyipyv.x13vifvy.x87ps6o.xuxw1ft.xh8yej3'
                    await page.waitForSelector(dm_selector)
                    await page.type(dm_selector," Hi ")
                    await asyncio.sleep(7)

                    send_dm_selector = '.x1i10hfl.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.xdl72j9.x2lah0s.xe8uvvx.xdj266r.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x9f619.x1ypdohk.x1f6kntn.xwhw2v2.xl56j7k.x17ydfre.x2b8uid.xlyipyv.x87ps6o.x14atkfc.xcdnw81.x1i0vuye.x1gjpkn9.x5n08af.xsz8vos'
                    await page.waitForSelector(send_dm_selector)
                    await page.click(send_dm_selector)
                    await asyncio.sleep(7)

                except ElementHandleError as e:
                    print(f"Error clicking on post_div: {e}")

        except pd.errors.ExcelFileNotFound:
            print("Error: Excel file 'profile_url.xlsx' not found.")

    except PageError as e:
        print(f"An error occurred: {e}")

    finally:
        await browser.close()

if __name__ == "__main__":
    asyncio.run(scroll_and_click_multiple_times())
