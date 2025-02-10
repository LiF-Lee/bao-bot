const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');

async function getJobList(page, pageSize) {
    const response = await axios.post(
        "https://www.gamejob.co.kr/Recruit/_GI_Job_List/",
        qs.stringify({
            order: 3,
            page: page,
            condition: {
                duty: [1, 2, 3, 4, 5, 6, 7, 8],
                career_stat: [0, 2],
                career: "1_3",
                edulevel: [4, 0],
                menucode: "",
                tabcode: 1
            },
            direct: 0,
            pagesize: pageSize,
            tabcode: 1
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest"
            }
        }
    );

    const $ = cheerio.load(response.data);
    const jobList = [];

    $(".tblList tbody tr").each((_, el) => {
        const company = $(el).find("td:nth-child(1) strong").text().trim();
        const jobTitle = $(el).find("td:nth-child(2) .tit a strong").text().trim();
        const jobLink = "https://www.gamejob.co.kr" + $(el).find("td:nth-child(2) .tit a").attr("href");
        const deadline = $(el).find("td:nth-child(3) .date").text().trim();
        const postedTime = $(el).find("td:nth-child(3) .modifyDate").text().trim().replace(" 등록", "");

        if (company && jobTitle && jobLink) {
            jobList.push({
                company,
                jobTitle,
                jobLink,
                deadline,
                postedTime
            });
        }
    });

    return jobList;
}

module.exports = {
    getJobList
};