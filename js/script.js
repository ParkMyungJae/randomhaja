window.onload = function () {
    var nickName = "";
    var roomName = "";
    var handle = null;
    var socket = io.connect(); //웹소켓서버에 연결한다.

    $("#nicknameBtn").on("click", function () {
        var nicknameValue = $("input[name='nickname']").val();
        nickName = nicknameValue;
        socket.emit("nickNameCheck", { name: nicknameValue });
    });
    socket.on("nullError", function (result) {
        alert(result);
    });
    socket.on("sameNameError", function (result) {
        alert(result);
    });
    socket.on("nickNameCheckComplete", function () {
        $("#chatBox").removeClass("chatDisabled").addClass("chatabled");
        $("#nickNameForm").css("display", "none");
        $("#sendMessage").hide(); $("#closing").hide();
        $("#ramdomChatFindBtn").show();
        $(".conChat").hide();
        clientCounting();
        $("#chat").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada;\">랜덤으로 낯선사람과 즐거운 채팅을 해보세요!</li>");
        $("#chat").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada; color: red;\">[사칭주의] 사이버수사대, 관리자는 채팅 방에 관여하지 않습니다. 자신이 '누구다' 하면 사칭입니다.</li>");
        $("#chat").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada; color: red;\">[사칭주의] 특정 링크를 제공하거나 다른 곳으로 유도, 금품 요구는 사기의 위험이 있을 수 있습니다.</li>");
        $("#chat").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada;\">법적 위반을 할 경우 민·형사상의 책임을 질 수 있습니다.</li>");
        $("#chat").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada;\">랜덤 채팅을 시작하시려면 아래의 \"랜덤 채팅 시작하기\"를 누르세요.</li>");
    });


    $("#ramdomChatFindBtn").on("click", function () {
        $("#chat").html("");
        socket.emit("randomChatFindClick", { name: nickName });
    })
    socket.on("randomChatFindClickComplete", function () {
        $("#chat").html("").append("<li>대화상대를 찾고있습니다...</li>");
        startFinding(); //실제로 대화상대찾기 시작

        // setTimeout(() => {
        //     stopFinding(); // 15초동안 대화 상대를 찾지 못하면 찾기 종료.
        //     $("#chat").html("").append("<li><p>대화 상대를 찾지 못하였습니다. 다시 시도해주세요.</p><hr></li>");
        // }, 15000);
    });
    socket.on("randomChatFiningComplete", function (data) {
        stopFinding(); //대화상대 찾기 멈추기.

        $("#chat").html("").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada;\"><a href=\"http://www.randomhaja.com/\">http://www.randomhaja.com/</a> 서버에 연결되었습니다.</li>");
        $("#chat").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada;\">대화방에 입장하였습니다. 즐거운 대화 하세요~~</li>");

        $("#sendMessage").show(); $("#closing").show(); // 메세지와 닫는 버튼 보여주기
        $("#ramdomChatFindBtn").hide(); // 랜덤 상대 찾기 버튼 숨기기
        $(".conChat").show();
        $(".noneConChat").hide();

        roomName = data;
    });

    $("#sendMessage").on("click", function () {
        var content = $("#content").val();
        // console.log(content);
        if (!content) {
            alert("대화내용을 입력해주세요.");
            return;
        }

        var str = "";
        str += "<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada;\">";
        str += "<strong>" + nickName + " : " + "</strong>";
        str += "<span>" + content + "</span>";
        str += "</li>";

        socket.emit("message", { roomName: roomName, data: str });
        $("#content").val("");
        // $("#chat").scrollTop($("#chat")[0].scrollHeight);
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    });

    socket.on("message", function (data) {
        $("#chat").append(data);
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    });

    $("#closing").on("click", function () {
        socket.emit("chatClosingBtn", { roomName: roomName });
    });

    socket.on("chatEnd", function (data) {
        $("#chat").append("<li style=\"margin-bottom: 5px; border-bottom: 1px dashed #dadada;\">대화방이 종료되었습니다.</li>");
        $("#sendMessage").hide(); $("#closing").hide();
        $("#ramdomChatFindBtn").show();
        $(".conChat").hide();
        $(".noneConChat").show();
        socket.emit("ChatClosing", { roomName: roomName });
    });

    socket.on("discWhileChat", function () {
        socket.emit("chatClosingBtn", { roomName: roomName });
    });

    socket.on("clientsCount", function (data) {
        $(".clientsCount").html(data);
    })

    function startFinding() {
        if (handle == null) {
            handle = setInterval(function () {
                socket.emit("randomChatFining", { name: nickName });
            }, 500);
        }
    }

    function stopFinding() {
        clearInterval(handle);
        handle = null;
    }

    function clientCounting() {
        setInterval(function () {
            socket.emit("clientsCount");
        }, 1500); //1.5초마다 clientsCount이벤트발생
    }
}