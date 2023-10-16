"use strict";

const dateNow = new Date(Date.now());
const dateTo = new Date(Date.now() + 86400000 * 6);

const token = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2IjoxLCJ1c2VyIjoibXljb21wYW55X19fIiwiaXNzIjoibG9naW4ubWV0ZW9tYXRpY3MuY29tIiwiZXhwIjoxNjk3NDU4OTE4LCJzdWIiOiJhY2Nlc3MifQ.mLEKIFs4w_9Oq4QmOleV-4bRJ5fLbX_uLnqSjxLnaD7_3m1dJCEQh2YfxlH4H2O-uy9-a48s86A1TDDd1JbWLA"

const refs = {
    form: document.querySelector(".form"),
    input: document.querySelector(".form__searching"),
    search: document.querySelector(".form__button__searching"),
    add: document.querySelector(".form__add__country"),
    list: document.querySelector(".list")
};

refs.add.addEventListener("click", (event) => {
    event.preventDefault();

    refs.form.insertAdjacentHTML("afterbegin",'<label>Країна:<input class="form__searching" type="text" name="county" /></label>');
});

refs.form.addEventListener("submit", serviceWether);

async function serviceSearching() {
    const inputsList = document.querySelectorAll(".form__searching");

    if (inputsList.length === 1) {
        try {
            const response = await axios.get(
                `https://restcountries.com/v3.1/name/${refs.input.value}`
            );
            const data = await response.data[0];
            return [[data.capital, data.capitalInfo]];
        } catch (error) {
            console.log(error);
        }
    }

    const responses = [...inputsList].map(async (input) => {
        try {
            const response = await axios.get(
                `https://restcountries.com/v3.1/name/${input.value}`
            );
            const data = await response.data[0];
            return [data.capital, data.capitalInfo];
        } catch (error) {
            console.log(error);
        }
    });

    return Promise.all(responses);
}

async function serviceWether(event) {
    event.preventDefault();

    refs.list.innerHTML = '';
    let markup = '';
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
        markup += `<li><a href=${linkHTML}>${data[0]}</a></li>`;
        console.log(data[0]);

        try {
            const res = await axios.get(linkJSON);
            return res;
            console.log(res.data)
            // console.log(res.data.data[0].coordinates[0].dates[0].value);
        } catch (error) {
            console.log(error);
        }
    });

    console.log(await Promise.all(responses));
    refs.list.innerHTML = markup;
}
