const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

async function scrapeGMC(holdingNo) {
    
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--single-process", 
            "--no-zygote",      
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null 
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000); 

    try {
        console.log(`[${holdingNo}] Navigating to GMC...`);
        await page.goto('https://gmcpropertytax.com/search/holdings', { waitUntil: 'networkidle2' });

        
        await page.waitForSelector('input[name="search"]');
        await page.type('input[name="search"]', holdingNo, { delay: 100 });

       
        const pageText = await page.evaluate(() => document.body.innerText);
        const match = pageText.match(/(\d+)\s*\+\s*(\d+)\s*=/);
        if (match) {
            const sum = parseInt(match[1]) + parseInt(match[2]);
            await page.type('input[name="captcha"]', String(sum), { delay: 100 });
        }

       
        const btnSelector = 'button[type="submit"]';
        await page.waitForFunction(
            (sel) => !document.querySelector(sel).hasAttribute('disabled'),
            { timeout: 10000 }, btnSelector
        );
        await delay(500);
        await page.click(btnSelector);

        
        try {
            await page.waitForFunction(() => document.body.innerText.includes("Result for holding"), { timeout: 10000 });
        } catch (e) {
            await browser.close();
            return { success: false, error: "Holding Number Not Found" };
        }

        
        console.log(`[${holdingNo}] Identity verified. Clicking Confirm...`);
        const confirmBtn = await page.waitForSelector('xpath///button[contains(., "Confirm & Proceed")]', { timeout: 5000 });
        
        
        await Promise.all([
            confirmBtn.click(),
            page.waitForFunction(() => document.body.innerText.includes("Payment Details"), { timeout: 15000 })
        ]);

        
        console.log(`[${holdingNo}] Extracting financial data...`);
        
        const finalData = await page.evaluate(() => {
            const text = document.body.innerText;
            
            
            const getMoney = (label) => {
                
                const regex = new RegExp(label + "[:\\s\\n]+([₹Rs.\\s]*[0-9,]+(\\.[0-9]{2})?)", "i");
                const match = text.match(regex);

                if (!match) return "0.00";
                return match[1].replace(/[^0-9.]/g, '');
            };

            const getText = (label) => {
                const regex = new RegExp(label + "[:\\s\\n]+(.*)", "i");
                const match = text.match(regex);
                return match ? match[1].trim() : "Not Found";
            };

            return {
                ownerName: getText("OWNER'S NAME"),
                financialYear: getText("FINANCIAL YEAR"),
                
                
                totalDemand: getMoney("TOTAL DEMAND"), 
                arrear: getMoney("ARREAR AMOUNT"),
                penalty: getMoney("PENALTY AMOUNT"),
                finalPayable: getMoney("Total Amount") 
            };
        });

        console.log(`[${holdingNo}] Success!`, finalData);
        await browser.close();
        return { success: true, data: finalData };

    } catch (error) {
        if (browser) await browser.close();
        console.error("Error:", error.message);
        return { success: false, error: error.message };
    }
}


app.get('/verify-gmc', async (req, res) => {
    const id = req.query.id;
    if (!id) return res.json({ error: "Missing ID parameter" });
    
    const result = await scrapeGMC(id);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Guwahati API is running on http://localhost:${PORT}`);
    console.log(`Test Link: http://localhost:${PORT}/verify-gmc?id=11190651`);
});