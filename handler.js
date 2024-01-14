const chromium = require("chrome-aws-lambda");

const isEmpty = (str) => {
  return !str || str.length === 0;
};

module.exports.handler = async (event) => {
  let browser = null;
  let eventData = event;
   
  if (eventData && !isEmpty(eventData?.html)) {
    try {      
      await chromium.font('/var/task/fonts/LiberationSans-Regular.ttf');
      await chromium.font('/var/task/fonts/LiberationSans-Bold.ttf');
      await chromium.font('/var/task/fonts/LiberationSans-BoldItalic.ttf');
      await chromium.font('/var/task/fonts/LiberationSans-Italic.ttf');
      await chromium.font('/var/task/fonts/DejaVuSans.ttf');

      browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
     
      const page = await browser.newPage();

      await page.setContent(eventData?.html);

      const pdfBuffer = await page.pdf({ ...eventData.options });

      await browser.close();

      return {
        statusCode: 200,
        body: {
          output: pdfBuffer,
          format: eventData?.type || '',
        },
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        }),
      };
    } finally {
      // Close the browser
      if (browser !== null) {
        await browser.close();
      }
    }
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Invalid Request body",
      }),
    };
  }
  
};
