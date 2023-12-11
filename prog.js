/*
MIT License

Copyright (c) 2023 Davi Saranszky Mesquita

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

function user(who) {
    fetch("/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: who,
        }),
    }).then(function (response) {
        return response.json();
    }).then(function (data) {

        let html = "";

        if (data && data.chat && data.chat.length > 0) {
            for (const message of data.chat) {
                if (message.role === "user") {

                    html += `
                    <!-- Chat: left -->
                    <li class="mb-3 d-flex flex-row align-items-end">
                        <div class="max-width-70">
                            <div class="user-info mb-1">
                                 <div class="avatar rounded-circle no-thumbnail">WH</div>
                                <span class="text-muted small">${data.whatsappUser}</span>
                            </div>
                            <div class="card border-0 p-3">
                                <div class="message">${message.content}</div>
                            </div>
                        </div>
                    </li>`

                } else if (message.role === "assistant") {

                    html +=
                        `<!-- Chat: right -->
                        <li class="mb-3 d-flex flex-row-reverse align-items-end">
                            <div class="max-width-70 text-end">
                                <div class="user-info mb-1">
                                    <span class="text-muted small">${message.operador}</span>
                                </div>
                                <div class="card border-0 p-3 bg-primary text-light">
                                    <div class="message">${message.content}</div>
                                </div>
                            </div>
                        </li>`

                }
            }
        }


        $("#chatPanel").html(html);

        // const scrollingElement = (document.scrollingElement || document.body);
        // scrollingElement.scrollTop = scrollingElement.scrollHeight;

    });
}

function next() {
    fetch("/next", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        let html = "";
        for (const key in data) {

            let user = data[key];

            html +=
                `<li class="list-group-item px-md-4 py-2 py-md-3">
                    <a href="javascript:user('${key}')" class="d-flex">
                        <div class="avatar rounded-circle no-thumbnail">WH</div>
                        <div class="flex-fill ms-3 text-truncate">
                            <h6 class="d-flex justify-content-between mb-0"><span>${user.nome}</span> <small class="msg-time small">${user.fechado ? 'Fechado' : 'Aberto'}</small></h6>
                            <span class="text-muted small">${user.fromNow}</span>
                        </div>
                    </a>
                </li>`;

        }

        $("#chatList").html(html);

        setTimeout(() => {

                next();

            },
            1000
        );

    });
}

function init() {
    $(function () {

        setTimeout(() => {

                next();

            },
            1000
        );
    });
}
