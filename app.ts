// 定义类型接口
interface Question {
    id: number;
    expression: string;
    answer: number;
    userAnswer?: number;
    isCorrect: boolean;
}

interface MathTypeConfig {
    min: number;
    max: number;
    operator: '+' | '-' | '×' | '÷';
    //  函数返回一个对象
    generate: (min: number, max: number) => {a: number, b: number, result: number};
}

// 全局变量
// 初始化为空数组
let currentQuestions: Question[] = [];
const questionCount = 10; // 题目数量
// record：键+值
const mathTypeConfigs: Record<string, MathTypeConfig> = {
    add10: {
        min: 0,
        max: 10,
        operator: '+',
        generate: (min: number, max: number) => {
            // Math.random()生成0-1的随机小数
            const a = Math.floor(Math.random() * (max - min + 1)) + min;
            const b = Math.floor(Math.random() * (max - min + 1)) + min;
            return {a, b, result: a + b};
        }
    },
    sub10: {
        min: 0,
        max: 10,
        operator: '-',
        generate: (min: number, max: number) => {
            let a, b;
            // 确保结果非负
            do {
                a = Math.floor(Math.random() * (max - min + 1)) + min;
                b = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (a < b);
            return {a, b, result: a - b};
        }
    },
    add100: {
        min: 0,
        max: 100,
        operator: '+',
        generate: (min: number, max: number) => {
            const a = Math.floor(Math.random() * (max - min + 1)) + min;
            const b = Math.floor(Math.random() * (max - min + 1)) + min;
            return {a, b, result: a + b};
        }
    },
    sub100: {
        min: 0,
        max: 100,
        operator: '-',
        generate: (min: number, max: number) => {
            let a, b;
            do {
                a = Math.floor(Math.random() * (max - min + 1)) + min;
                b = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (a < b);
            return {a, b, result: a - b};
        }
    },
    mul100: {
        min: 1,
        max: 100,
        operator: '×',
        generate: (min: number, max: number) => {
            // 限制乘数大小，避免结果过大
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            return {a, b, result: a * b};
        }
    },
    div100: {
        min: 1,
        max: 100,
        operator: '÷',
        generate: (min: number, max: number) => {
            // 确保整除
            let a, b, result;
            do {
                b = Math.floor(Math.random() * 10) + 1;
                result = Math.floor(Math.random() * 10) + 1;
                a = b * result;
            } while (a > 100);
            return {a, b, result};
        }
    }
};

// DOM 元素获取
function getDOMElements() {
    return {
        // as断言
        mathTypeSelect: document.getElementById('math-type') as HTMLSelectElement,
        startBtn: document.getElementById('start-btn') as HTMLButtonElement,
        quizContainer: document.getElementById('quiz-container') as HTMLDivElement,
        questionsContainer: document.getElementById('questions') as HTMLDivElement,
        submitBtn: document.getElementById('submit-btn') as HTMLButtonElement,
        resultContainer: document.getElementById('result-container') as HTMLDivElement,
        scoreElement: document.getElementById('score') as HTMLDivElement,
        feedbackElement: document.getElementById('feedback') as HTMLDivElement,
        restartBtn: document.getElementById('restart-btn') as HTMLButtonElement
    };
}

// 初始化事件监听
function initEventListeners() {
    const elements = getDOMElements();

    // 题型选择变化，按钮可用状态
    elements.mathTypeSelect.addEventListener('change', () => {
        elements.startBtn.disabled = !elements.mathTypeSelect.value;
    });

    // 开始答题
    elements.startBtn.addEventListener('click', generateQuestions);

    // 提交答案
    elements.submitBtn.addEventListener('click', checkAnswers);

    // 重新答题
    elements.restartBtn.addEventListener('click', resetQuiz);
}

// 生成随机题目
function generateQuestions() {
    const elements = getDOMElements();
    // 清空残留数据
    currentQuestions = [];
    elements.questionsContainer.innerHTML = '';
    // 拿到选择器的值
    const selectedType = elements.mathTypeSelect.value;
    // 在字典中取出相应对象
    const config = mathTypeConfigs[selectedType];

    if (!config) {
        alert('请选择有效的题目类型！');
        return;
    }

    // 生成指定数量的题目
    for (let i = 0; i < questionCount; i++) {
        const {a, b, result} = config.generate(config.min, config.max);
        const question: Question = {
            id: i + 1,
            expression: `${a} ${config.operator} ${b} = ?`,
            answer: result,
            isCorrect: false
        };
        // 推入数组
        currentQuestions.push(question);

        // 创建题目DOM元素
        // 创建一个题目容器，类名为question，与css内相应
        const questionElement = document.createElement('div');
        questionElement.className = 'question';
        questionElement.innerHTML = `
            <div class="question-number">${i + 1}</div>
            <div class="question-text">${a} ${config.operator} ${b} =</div>
            // data-id：比较宽泛的id，可以重复
            <input type="number" class="answer-input" data-id="${i + 1}" placeholder="输入答案">
            <div class="result-icon" data-id="${i + 1}"></div>
        `;
        // 将新的对象挂载到question类下
        elements.questionsContainer.appendChild(questionElement);
    }

    // 显示答题区域
    elements.quizContainer.style.display = 'block';
    // 滚动到答题区域
    elements.quizContainer.scrollIntoView({behavior: 'smooth'});
}

// 检查答案
function checkAnswers() {
    const elements = getDOMElements();
    let correctCount = 0;
    // 拿到输入框数组
    const answerInputs = document.querySelectorAll('.answer-input') as NodeListOf<HTMLInputElement>;

    // 验证每个答案
    // foreach方法：对数组元素执行相同操作,每次取出的元素叫做input
    answerInputs.forEach(input => {
        // parseint将字符串转为整形，！：非空断言
        const questionId = parseInt(input.dataset.id!);
        // 找到这一题，q为回调函数，在数组中取值
        const question = currentQuestions.find(q => q.id === questionId);
        const userAnswer = parseFloat(input.value);
        
        if (question) {
            question.userAnswer = userAnswer;
            // is not a number
            question.isCorrect = !isNaN(userAnswer) && userAnswer === question.answer;
            
            // 更新结果图标
            const resultIcon = document.querySelector(`.result-icon[data-id="${questionId}"]`) as HTMLDivElement;
            resultIcon.style.display = 'flex';
            
            if (question.isCorrect) {
                correctCount++;
                resultIcon.className = 'result-icon correct';
                resultIcon.textContent = '✓';
                input.style.borderColor = 'var(--success-color)';
            } else {
                resultIcon.className = 'result-icon incorrect';
                resultIcon.textContent = '✗';
                input.style.borderColor = 'var(--error-color)';
                // 显示正确答案
                input.value += ` (正确: ${question.answer})`;
            }
            
            // 禁用输入框
            input.disabled = true;
        }
    });

    // 计算得分并显示结果
    const score = correctCount;
    elements.scoreElement.textContent = `${score}/${questionCount}`;
    
    // 根据得分给出反馈
    let feedback = '';
    if (score === 10) {
        feedback = '太棒了！你全答对了，真是数学天才！';
    } else if (score >= 8) {
        feedback = '非常优秀！继续保持这个水平！';
    } else if (score >= 6) {
        feedback = '做得不错，再努力一点就更棒了！';
    } else if (score >= 4) {
        feedback = '还可以，多做练习就能提高！';
    } else {
        feedback = '加油！多做练习，你会越来越厉害的！';
    }
    elements.feedbackElement.textContent = feedback;

    // 显示结果区域
    elements.resultContainer.style.display = 'block';
    // 禁用提交按钮
    elements.submitBtn.disabled = true;
    // 滚动到结果区域
    elements.resultContainer.scrollIntoView({behavior: 'smooth'});
}

// 重置答题系统
function resetQuiz() {
    const elements = getDOMElements();
    // 重置UI
    elements.mathTypeSelect.value = '';
    elements.startBtn.disabled = true;
    elements.quizContainer.style.display = 'none';
    elements.resultContainer.style.display = 'none';
    elements.submitBtn.disabled = false;
    currentQuestions = [];
    
    // 滚动到顶部
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// 初始化应用
function init() {
    initEventListeners();
    console.log('数学答题系统初始化完成！');
}

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', init);