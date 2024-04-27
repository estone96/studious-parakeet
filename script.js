const calendarGrid = document.getElementById('calendarGrid');
const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
const monthDays = 31; // 5월은 31일까지 있음

// 5월 1일은 수요일부터 시작함
let startingDayIndex = 3; // 수요일

function createCalendar() {
    // 요일 표시
    for (let i = 0; i < 7; i++) {
        const dayCell = document.createElement('div');
        dayCell.textContent = daysOfWeek[i];
        calendarGrid.appendChild(dayCell);
    }

    // 달력 날짜 표시
    let currentDate = 1;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startingDayIndex) {
                const emptyCell = document.createElement('div');
                calendarGrid.appendChild(emptyCell);
            } else if (currentDate <= monthDays) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.textContent = currentDate;

                // 입력 폼 생성
                for (let k = 0; k < 3; k++) {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'text');
                    input.setAttribute('placeholder', `${currentDate}, 내용${k + 1}`);
                    cell.appendChild(input);
                }

                calendarGrid.appendChild(cell);
                currentDate++;
            }
        }
    }
}

createCalendar();

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];

    // 날짜, 첫째줄 내용, 둘째줄 내용, 셋째줄 내용 형태로 CSV 데이터 작성
    for (let i = 0; i < calendarGrid.children.length; i++) {
        const cell = calendarGrid.children[i];
        if (cell.classList.contains('cell')) {
            let row = [];
            row.push(cell.textContent);
            const inputs = cell.querySelectorAll('input');
            inputs.forEach(input => {
                row.push(input.value);
            });
            rows.push(row.join(','));
        }
    }

    csvContent += rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "calendar_events.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
}

// 창 크기 변경에 따라 테이블 크기 조정
window.addEventListener('resize', () => {
    resizeTable();
});

function resizeTable() {
    const calendarWidth = calendarGrid.offsetWidth;
    const cellWidth = calendarWidth / 7;
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.style.width = cellWidth + 'px';
        const inputs = cell.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.width = 'calc(100% - 10px)'; // 입력 필드의 너비를 셀 너비에 맞게 설정
        });
    });
}

// 데이터를 파일로 저장하는 함수
function saveToFile() {
    const data = [];

    // 입력된 데이터를 수집하여 data 배열에 추가
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = {
            date: cell.textContent,
            contents: []
        };
        const inputs = cell.querySelectorAll('input');
        inputs.forEach(input => {
            row.contents.push(input.value);
        });
        data.push(row);
    });

    // JSON 형태로 변환
    const jsonData = JSON.stringify(data);

    // 파일로 저장
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 파일에서 데이터를 로드하는 함수
function loadFromFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const jsonData = event.target.result;
        const data = JSON.parse(jsonData);

        // 로드된 데이터를 화면에 반영
        const cells = document.querySelectorAll('.cell');
        data.forEach((row, index) => {
            const inputs = cells[index].querySelectorAll('input');
            row.contents.forEach((content, idx) => {
                inputs[idx].value = content;
            });
        });
    };

    reader.readAsText(file);
}
