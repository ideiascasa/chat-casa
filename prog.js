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

function chatPanelUpdate(html) {
    $("#chatPanel").html(html);

    const objDiv = document.getElementById("chatPanel");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function atualizaChat() {

    const telefone = $("#chatID").html();

    if (telefone && telefone !== '1') {
        user(telefone);
    } else {
        chatPanelUpdate('');
    }

}


function user(who) {

    $("#chatID").html(who);

    if (who === '1') {

        chatPanelUpdate(`<!-- Chat: left -->
                    <li class="mb-3 d-flex flex-row align-items-end">
                        <div class="max-width-70">
                            <div class="user-info mb-1">
                                 <div class="avatar rounded-circle no-thumbnail">IA</div>
                                <span class="text-muted small">IA</span>
                            </div>
                            <div class="card border-0 p-3">
                                <div class="message">Em que posso ser útil?</div>
                            </div>
                        </div>
                    </li>`
        );

    } else {

        fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({
                user: who,
            }),
        }).then(function (response) {
            return response.json();
        }).then(function (data) {

            let html = "";

            let waba = null;
            let whatsappUser = "";
            if (data && data.chat && data.chat.length > 0) {
                for (const message of data.chat) {

                    waba = message.waba;

                    if (message.role === "user") {

                        whatsappUser=data.whatsappUser;

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

            $("#wabaID").html(waba);
            $("#chatNome").html(whatsappUser);
            chatPanelUpdate(html);

        });


    }
}

function next() {
    fetch("/api/next", {
        method: "GET",
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        let html = "";

        html +=
            `<li class="list-group-item px-md-4 py-2 py-md-3">
                    <a href="javascript:user('1')" class="d-flex">
                        <div class="avatar rounded-circle no-thumbnail">IA</div>
                        <div class="flex-fill ms-3 text-truncate">
                            <h6 class="d-flex justify-content-between mb-0"><span>IA</span></h6>
                            <span class="text-muted small">gpt-3.5-turbo</span>
                        </div>
                    </a>
                </li>`;

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
        atualizaChat();

        setTimeout(() => {

                next();

            },
            10000
        );

    });
}

function init() {
    $(function () {

        setTimeout(() => {

                next();

            },
            100
        );
    });
}

function send() {

    let chat = $("#textChat").val();
    chat = chat.trim();

    $("#textChat").val('');

    if (chat.length > 0) {

        const user = $("#chatID").html();
        const waba = $("#wabaID").html();
        fetch("/api/send", {
            method: "POST",
            body: JSON.stringify({
                user,
                chat,
                waba,
            }),
        }).then(r => {
            setTimeout(() => {

                    atualizaChat();

                },
                2000
            );
        });

    }

}
