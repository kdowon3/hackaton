document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.draggable');
    const boatContainer = document.getElementById('boat-container');
    const leftBank = document.getElementById('left-bank');
    const rightBank = document.getElementById('right-bank');
    const restartButton = document.getElementById('restart');
    const wolf = document.getElementById('wolf');
    const sheep = document.getElementById('sheep');
    const cabbage = document.getElementById('cabbage');
    const shipman = document.getElementById('min');
    let boatOnLeft = true;
    let startTime;
    let timerInterval;
    let isGameWon = false; // 게임 종료 여부 플래그

    // 타이머 관련 함수들
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
        console.log("Timer started"); // 디버그용 로그 추가
    }

    function updateTimer() {
        const now = new Date();
        const elapsedTime = new Date(now - startTime);
        const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
        const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');
        document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
        console.log("Timer updated:", `${hours}:${minutes}:${seconds}`); // 디버그용 로그 추가
    }

    function stopTimer() {
        clearInterval(timerInterval);
        const now = new Date();
        const elapsedTime = new Date(now - startTime);
        return elapsedTime;
    }

    function gameWon() {
        if (isGameWon) return; // 이미 게임이 종료된 경우 실행하지 않음
        isGameWon = true;

        const timeTaken = stopTimer();
        const timeTakenStr = timeTaken.toISOString();
        console.log('Sending time_taken:', timeTakenStr); // 디버그 로그 추가

        fetch('/win/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                'time_taken': timeTakenStr,
            }),
        })
        .then(response => {
            console.log('Fetch response:', response); // 디버그 로그 추가
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Fetch success:', data); // 디버그 로그 추가
                window.location.href = "/win/"; // win.html로 이동
            } else {
                console.error('Error recording time:', data.error); // 에러 로그 추가
                alert('Error recording time');
            }
        })
        .catch(error => console.error('Fetch error:', error)); // Fetch 에러 추가
    }

    function getCsrfToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        console.log('CSRF Token:', csrfToken); // CSRF 토큰을 디버그 로그에 출력
        return csrfToken;
    }

    const originalShipmanSrc = shipman.src; // 원래 shipman 이미지 경로 저장
    const originalShipmanStyle = { // 원래 shipman 스타일 저장
        width: shipman.style.width,
        height: shipman.style.height,
        bottom: shipman.style.bottom,
        left: shipman.style.left,
        top: shipman.style.top
    };

    items.forEach((item) => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });

    boatContainer.addEventListener('dragover', dragOver);
    boatContainer.addEventListener('drop', drop);

    leftBank.addEventListener('dragover', dragOver);
    leftBank.addEventListener('drop', drop);

    rightBank.addEventListener('dragover', dragOver);
    rightBank.addEventListener('drop', drop);

    restartButton.addEventListener('click', resetGame);

    function dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
        event.target.style.transform = 'scale(1.3)';
    }

    function dragEnd(event) {
        event.target.style.transform = 'scale(1)';
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData('text');
        const draggableElement = document.getElementById(id);
        const dropzone = event.target.closest('.bank') || event.target.closest('#boat-container');

        // 드래그 대상이 배에 실릴 때
        if (dropzone.id === 'boat-container') {
            const boatItems = Array.from(boatContainer.children);
            const nonShipmanItems = boatItems.filter((item) => item.classList.contains('draggable'));

            if (nonShipmanItems.length >= 1) {
                alert('배에는 뱃사공 외에 하나의 요소만 탑승할 수 있습니다.');
                return;
            }

            // 가까운 강둑에서만 배에 실을 수 있도록 설정
            if (
                (boatOnLeft && draggableElement.parentNode.id !== 'left-bank') ||
                (!boatOnLeft && draggableElement.parentNode.id !== 'right-bank')
            ) {
                alert('배가 가까운 강둑에서만 이미지를 실을 수 있습니다.');
                return;
            }

            dropzone.appendChild(draggableElement);
            draggableElement.style.position = 'absolute';
            updateBoatElementPosition(draggableElement);
        } else {
            // 강둑으로 이미지를 내릴 때
            if (draggableElement.parentNode.id === 'boat-container') {
                // 배에서 내리는 경우, 가까운 강둑에만 내릴 수 있도록 설정
                if ((boatOnLeft && dropzone.id !== 'left-bank') || (!boatOnLeft && dropzone.id !== 'right-bank')) {
                    alert('배가 가까운 강둑에만 이미지를 내릴 수 있습니다.');
                    return;
                }
                dropzone.appendChild(draggableElement);
                draggableElement.style.position = 'absolute';
                updateElementPosition(draggableElement, dropzone.id);
                resetShipmanImage(); // 뱃사공 이미지를 초기 이미지로 되돌림

                // 게임 상태 확인
                setTimeout(checkGameState, 100);
            } else if (
                draggableElement.parentNode.id === 'left-bank' ||
                draggableElement.parentNode.id === 'right-bank'
            ) {
                // 강둑 간 이동을 방지
                if (
                    (dropzone.id === 'left-bank' && draggableElement.parentNode.id === 'right-bank') ||
                    (dropzone.id === 'right-bank' && draggableElement.parentNode.id === 'left-bank')
                ) {
                    alert('이미지를 배에 실은 후에만 다른 쪽 강둑으로 이동할 수 있습니다.');
                    return;
                }
                dropzone.appendChild(draggableElement);
                draggableElement.style.position = 'absolute';
                updateElementPosition(draggableElement, dropzone.id);
            } else {
                dropzone.appendChild(draggableElement);
                draggableElement.style.position = 'absolute';
                updateElementPosition(draggableElement, dropzone.id);
            }
        }
    }

    document.getElementById('move-button').addEventListener('click', moveBoat);

    boatContainer.addEventListener('transitionend', () => {
        // 이 이벤트 핸들러는 배가 이동한 후에 게임 상태를 확인합니다.
        setTimeout(checkGameState, 100);
    });

    function moveBoat() {
        if (boatOnLeft) {
            boatContainer.style.transition = 'left 1s';
            boatContainer.style.left = 'calc(65% - 100px)'; // 오른쪽으로 이동
            boatOnLeft = false;
        } else {
            boatContainer.style.transition = 'left 1s';
            boatContainer.style.left = '0'; // 왼쪽으로 이동
            boatOnLeft = true;
        }

        // 이동 후 게임 상태 확인
        setTimeout(() => {
            const leftBankItems = Array.from(leftBank.children);
            const rightBankItems = Array.from(rightBank.children);
            const boatItems = Array.from(boatContainer.children);

            if (boatItems.length > 1) {
                checkGameState();
            } else {
                if (leftBankItems.includes(wolf) && leftBankItems.includes(sheep) && !leftBankItems.includes(shipman)) {
                    return; // lose 페이지로 이동하지 않음
                } else if (
                    leftBankItems.includes(sheep) &&
                    leftBankItems.includes(cabbage) &&
                    !leftBankItems.includes(shipman)
                ) {
                    return; // lose 페이지로 이동하지 않음
                } else if (
                    rightBankItems.includes(wolf) &&
                    rightBankItems.includes(sheep) &&
                    !rightBankItems.includes(shipman)
                ) {
                    return; // lose 페이지로 이동하지 않음
                } else if (
                    rightBankItems.includes(sheep) &&
                    rightBankItems.includes(cabbage) &&
                    !rightBankItems.includes(shipman)
                ) {
                    return; // lose 페이지로 이동하지 않음
                }
            }
        }, 100); // 상태 확인
    }

    function checkGameState() {
        const boatItems = Array.from(boatContainer.children);
        const leftBankItems = Array.from(leftBank.children);
        const rightBankItems = Array.from(rightBank.children);

        // Check for game success
        if (rightBankItems.includes(wolf) && rightBankItems.includes(sheep) && rightBankItems.includes(cabbage)) {
            // 1초 후 게임 성공 페이지로 이동
            setTimeout(() => {
                gameWon(); // 게임 성공 시 게임 종료 처리 함수 호출
            }, 1000);
            return;
        }

        // Check for game over conditions
        if (isGameOver(leftBankItems, boatOnLeft) || isGameOver(rightBankItems, !boatOnLeft)) {
            return; // 게임 오버 발생 시 더 이상 진행하지 않음
        }
    }

    function isGameOver(bankItems, shipmanOnBank) {
        if (!shipmanOnBank) {
            // 셋 다 있는 경우에는 게임 오버가 발생하지 않도록 함
            if (bankItems.includes(wolf) && bankItems.includes(sheep) && bankItems.includes(cabbage)) {
                return false; // 셋 다 있는 경우 게임 오버가 아님
            }

            if (bankItems.includes(wolf) && bankItems.includes(sheep) && bankItems.length < 4) {
                window.location.href = '/lose1/'; // lose1 페이지로 이동
                return true;
            }
            if (bankItems.includes(sheep) && bankItems.includes(cabbage) && bankItems.length < 4) {
                window.location.href = '/lose2/'; // lose2 페이지로 이동
                return true;
            }
        }
        return false;
    }

    function resetGame() {
        leftBank.appendChild(wolf);
        leftBank.appendChild(sheep);
        leftBank.appendChild(cabbage);
        leftBank.appendChild(shipman);

        wolf.style.position = 'absolute';
        sheep.style.position = 'absolute';
        cabbage.style.position = 'absolute';
        shipman.style.position = 'absolute';

        updateElementPosition(wolf, 'left-bank');
        updateElementPosition(sheep, 'left-bank');
        updateElementPosition(cabbage, 'left-bank');
        updateElementPosition(shipman, 'left-bank');

        boatContainer.innerHTML = ''; // 배를 비움
        boatOnLeft = true;

        // 페이지 새로고침
        location.reload();
    }

    function updateElementPosition(element, bank) {
        if (bank === 'left-bank') {
            switch (element.id) {
                case 'wolf':
                    element.style.bottom = '120px';
                    element.style.left = '240px';
                    break;
                case 'sheep':
                    element.style.bottom = '60px';
                    element.style.left = '200px';
                    break;
                case 'cabbage':
                    element.style.bottom = '0';
                    element.style.left = '125px';
                    break;
                case 'min':
                    element.style.bottom = '0';
                    element.style.left = '125px';
                    break;
            }
        } else if (bank === 'right-bank') {
            switch (element.id) {
                case 'wolf':
                    element.style.bottom = '100px';
                    element.style.left = '0px'; // 반대편 위치 설정
                    break;
                case 'sheep':
                    element.style.bottom = '60px';
                    element.style.left = '80px'; // 반대편 위치 설정
                    break;
                case 'cabbage':
                    element.style.bottom = '0';
                    element.style.left = '140px'; // 반대편 위치 설정
                    break;
                case 'min':
                    element.style.bottom = '0';
                    element.style.left = '175px'; // 반대편 위치 설정
                    break;
            }
        }
    }

    function updateBoatElementPosition(element) {
        element.style.bottom = '11px';
        switch (element.id) {
            case 'wolf':
                element.style.left = '0px';
                break;
            case 'sheep':
                element.style.left = '10px';
                shipman.src = '/static/images/minwithbang.png'; // sheep을 배에 태우면 이미지를 변경
                shipman.style.width = originalShipmanStyle.width;
                shipman.style.height = originalShipmanStyle.height;
                shipman.style.bottom = originalShipmanStyle.bottom;
                shipman.style.left = originalShipmanStyle.left;
                shipman.style.top = originalShipmanStyle.top;
                break;
            case 'cabbage':
                element.style.left = '0';
                shipman.src = '/static/images/minwithnew.png'; // cabbage를 배에 태우면 이미지를 변경
                shipman.style.width = '100px'; // 커스텀 사이즈 설정
                shipman.style.height = '120px'; // 커스텀 사이즈 설정
                shipman.style.bottom = ''; // 기존 bottom 값 초기화
                shipman.style.top = '-36px'; // 커스텀 위치 설정
                shipman.style.left = '120px'; // 커스텀 위치 설정
                break;
        }
        element.style.margin = '5px';
    }

    function resetShipmanImage() {
        shipman.src = originalShipmanSrc; // 기본 이미지로 변경
        shipman.style.width = originalShipmanStyle.width;
        shipman.style.height = originalShipmanStyle.height;
        shipman.style.bottom = originalShipmanStyle.bottom;
        shipman.style.left = originalShipmanStyle.left;
        shipman.style.top = originalShipmanStyle.top;
    }

    startTimer(); // 페이지 로드 시 타이머 시작
});
