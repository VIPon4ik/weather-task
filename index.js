"use strict";

const dateNow = new Date(Date.now());
const dateTo = new Date(Date.now() + 86400000 * 6);

const token = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2IjoxLCJ1c2VyIjoibXljb21wYW55X19fIiwiaXNzIjoibG9naW4ubWV0ZW9tYXRpY3MuY29tIiwiZXhwIjoxNjk3NDc1MzEyLCJzdWIiOiJhY2Nlc3MifQ.i66oTBYZIz2fRce4bpD6oUpCzj1eBVHFm-7fsX-WK8yMZvweh67ANyVUS8k7pK3wdze95HufSEVDa_XDrkTDqQ"

const refs = {
    form: document.querySelector(".form"),
    input: document.querySelector(".form__searching"),
    search: document.querySelector(".form__button__searching"),
    graphs: document.querySelector(".graphs"),
};


refs.form.addEventListener("submit", serviceWether);

function executeHighchartsCode() {
    var totalHeight = $(window).height();
    var totalWidth = $(window).width();

    $(`#container`).width(totalWidth / 3 * 2);
    $(`#container`).height(totalHeight / 3 * 2);

    if (totalHeight < 500) {
        $(`#container`).height(totalHeight);
    }
    if (totalWidth < 800) {
        $(`#container`).width(totalWidth);
    }

    var csv = $(`#csv`).text();

    csv = csv.replace(/-999\;/g, ";");
    csv = csv.replace(/-999\n/g, "\n");
    csv = csv.replace(/-666\;/g, ";");
    csv = csv.replace(/-666\n/g, "\n");

    $(`#container`).highcharts({
        chart: {
            type: 'line',
            zoomType: 'xy'
        },
        credits: {
            text: 'meteomatics.com',
            href: 'http://www.meteomatics.com'
        },
        data: {
            csv: csv,
            itemDelimiter: ';',
            lineDelimiter: '\n',
            parseDate: function (txt) {
                var t = new Date(txt).getTime();
                return t;
            }
        },
        tooltip: {
            shared: true
        },
        title: {
            text: null
        },
        yAxis: {
            title: {
                text: null
            }
        },
        plotOptions: {
            series: {
                animation: false
            }
        }
    });
}

async function serviceSearching() {
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${refs.input.value}`);
        const data = await response.data[0];
        return [[data.capital, data.capitalInfo]];
    } catch (error) {
        console.log(error);
    }
}

async function serviceWether(event) {
    event.preventDefault();

    const capitalData = [...(await serviceSearching())];

    const responses = capitalData.filter((data) => {
        if (!data) {
            return false;
        }

        return true;
    })
    .map(async (data) => {
        const coords = data[1].latlng;
        const linkJSON = `https://api.meteomatics.com/${dateNow.toISOString()}--${dateTo.toISOString()}:P1D/t_2m:C/${coords[0]},${coords[1]}/json?access_token=${token}`;
        const linkHTML = `https://api.meteomatics.com/${dateNow.toISOString()}--${dateTo.toISOString()}:P1D/t_2m:C/${coords[0]},${coords[1]}/html?access_token=${token}`;

        try {
            const res = await axios.get(linkJSON);
            const resHTML = await axios.get(linkHTML);

            const receivedHTML = resHTML.data.slice(2101, resHTML.data.length - 16);
            console.log(receivedHTML);

            refs.graphs.innerHTML = receivedHTML;
            executeHighchartsCode();
            
            return res;
        } catch (error) {
            console.log(error);
        }
    });

    console.log(await Promise.all(responses));
}
