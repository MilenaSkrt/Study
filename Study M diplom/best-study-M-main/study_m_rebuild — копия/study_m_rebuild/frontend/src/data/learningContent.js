export const learningCases = [
  {
    id: "bullet-plate",
    title: "Попадание пули в тарелку",
    goal: "Определить параметры выстрела, при которых пуля попадает в движущуюся цель.",
    statement:
      "В основе задачи лежит математическая модель движения тела, брошенного под углом к горизонту. Студент исследует влияние начальной скорости и угла выстрела на траекторию движения.",
    formulas: [
      "x(t)=v₀cos(α)t",
      "y(t)=v₀sin(α)t−gt²/2"
    ],
    visualization: {
      type: "bullet",
      config: {
        g: 9.81,
        v0: 58,
        angleDeg: 28,
        targetX0: 25,
        targetY: 8,
        targetV: 5
      }
    },
    steps: [
      {
        title: "Шаг 1. Задаём исходные параметры",
        text: "Определяются начальная скорость, угол выстрела, координаты цели и ускорение свободного падения.",
        code: `import math

g = 9.81
v0 = 60
alpha = math.radians(25)

target_x0 = 25
target_y = 8
target_v = 5`
      },
      {
        title: "Шаг 2. Рассчитываем координаты пули и цели",
        text: "Для каждого момента времени вычисляются координаты пули и движущейся тарелки.",
        code: `bullet_x = v0 * math.cos(alpha) * t
bullet_y = v0 * math.sin(alpha) * t - g * t**2 / 2

target_x = target_x0 + target_v * t`
      },
      {
        title: "Шаг 3. Определяем минимальную ошибку попадания",
        text: "Попадание оценивается по минимальному расстоянию между пулей и целью.",
        code: `error = ((bullet_x - target_x)**2 + (bullet_y - target_y)**2) ** 0.5`
      }
    ],
    fullCode: `import math

g = 9.81

target_x0 = 25
target_y = 8
target_v = 5

best_result = None
best_error = 10**9

for angle_deg in range(15, 55):
    for v0 in range(35, 91):
        alpha = math.radians(angle_deg)

        for i in range(500):
            t = i * 0.01

            bullet_x = v0 * math.cos(alpha) * t
            bullet_y = v0 * math.sin(alpha) * t - g * t**2 / 2

            target_x = target_x0 + target_v * t

            error = ((bullet_x - target_x)**2 + (bullet_y - target_y)**2) ** 0.5

            if error < best_error:
                best_error = error
                best_result = (angle_deg, v0, t, bullet_x, bullet_y, target_x)

angle_deg, v0, t, bullet_x, bullet_y, target_x = best_result

print("Лучший угол:", angle_deg, "градусов")
print("Лучшая скорость:", v0, "м/с")
print("Время встречи:", round(t, 3), "с")
print("Координаты пули:", round(bullet_x, 3), round(bullet_y, 3))
print("Координаты цели:", round(target_x, 3), target_y)
print("Ошибка:", round(best_error, 3))

if best_error < 0.5:
    print("Результат: попадание возможно")
else:
    print("Результат: требуется расширить диапазон поиска")`
   },

  {
    id: "ball-basket-wall",
    title: "Шарик — корзина — стена",
    goal: "Определить параметры броска, при которых шарик после отражения от стены попадает в корзину.",
    statement:
      "Модель учитывает движение шарика под углом к горизонту и отражение от вертикальной стены. После отражения направление горизонтальной скорости изменяется согласно закону отражения.",
    formulas: [
      "x(t)=v₀cos(α)t",
      "y(t)=h+v₀sin(α)t−gt²/2",
      "αпадения = αотражения"
    ],
    visualization: {
      type: "wall-basket",
      config: {
        g: 9.81,
        h: 1.5,
        v0: 10,
        angleDeg: 48,
        wallX: 5.0,
        basketX: 4.2,
        basketY: 3.05
      }
    },
    steps: [
      {
        title: "Шаг 1. Задаём параметры броска и стены",
        text: "Указываются начальная высота, скорость, угол, координата стены и координаты корзины.",
        code: `import math

g = 9.81
h = 1.5
v0 = 10
alpha = math.radians(48)

wall_x = 5.0
basket_x = 4.2
basket_y = 3.05`
      },
      {
        title: "Шаг 2. Находим точку удара о стену",
        text: "Вычисляется время достижения стены и высота шарика в момент отражения.",
        code: `vx = v0 * math.cos(alpha)
vy = v0 * math.sin(alpha)

t_wall = wall_x / vx
y_wall = h + vy * t_wall - g * t_wall**2 / 2`
      },
      {
        title: "Шаг 3. Считаем движение после отражения",
        text: "После удара горизонтальная скорость меняет знак, а вертикальная составляющая продолжает изменяться под действием силы тяжести.",
        code: `vx_after = -vx`
      }
    ],
    fullCode: `import math

g = 9.81
h = 1.5
v0 = 10
alpha = math.radians(48)

wall_x = 5.0
basket_x = 4.2
basket_y = 3.05

vx = v0 * math.cos(alpha)
vy = v0 * math.sin(alpha)

t_wall = wall_x / vx
y_wall = h + vy * t_wall - g * t_wall**2 / 2
vy_wall = vy - g * t_wall

vx_after = -vx

best_error = 10**9
best_point = None

for i in range(300):
    tau = i * 0.02
    x = wall_x + vx_after * tau
    y = y_wall + vy_wall * tau - g * tau**2 / 2

    error = ((x - basket_x)**2 + (y - basket_y)**2) ** 0.5

    if error < best_error:
        best_error = error
        best_point = (x, y)

print("Высота удара о стену:", round(y_wall, 3))
print("Минимальная ошибка попадания:", round(best_error, 3))
print("Ближайшая точка:", tuple(round(v, 3) for v in best_point))`
  },

  {
    id: "cauchy-rk4",
    title: "Задача Коши и метод Рунге–Кутта",
    goal: "Реализовать численное решение обыкновенного дифференциального уравнения первого порядка.",
    statement:
      "Студент реализует метод Рунге–Кутта 4-го порядка и исследует поведение решения при разных начальных условиях и шагах интегрирования.",
    formulas: [
      "dy/dx=f(x,y)",
      "y(x₀)=y₀",
      "yₙ₊₁ = yₙ + h(k₁+2k₂+2k₃+k₄)/6"
    ],
    visualization: {
      type: "rk4",
      config: {
        equation: "x+y",
        x0: 0,
        y0: 1,
        h: 0.1,
        steps: 20
      }
    },
    steps: [
      {
        title: "Шаг 1. Записываем правую часть уравнения",
        text: "Функция f(x,y) задаёт производную искомой функции.",
        code: `def f(x, y):
    return x + y`
      },
      {
        title: "Шаг 2. Задаём начальные условия",
        text: "Начальные условия определяют стартовую точку численного решения.",
        code: `x = 0.0
y = 1.0
h = 0.1
steps = 20`
      },
      {
        title: "Шаг 3. Вычисляем коэффициенты RK4",
        text: "На каждом шаге рассчитываются четыре промежуточные оценки производной.",
        code: `k1 = f(x, y)
k2 = f(x + h / 2, y + h * k1 / 2)
k3 = f(x + h / 2, y + h * k2 / 2)
k4 = f(x + h, y + h * k3)`
      }
    ],
    fullCode: `def f(x, y):
    return x + y

x = 0.0
y = 1.0
h = 0.1
steps = 20

for i in range(steps + 1):
    print(round(x, 3), round(y, 6))

    k1 = f(x, y)
    k2 = f(x + h / 2, y + h * k1 / 2)
    k3 = f(x + h / 2, y + h * k2 / 2)
    k4 = f(x + h, y + h * k3)

    y = y + h * (k1 + 2*k2 + 2*k3 + k4) / 6
    x = x + h`
  },

  {
    id: "nelder-mead",
    title: "Численная оптимизация и метод Нелдера–Мида",
    goal: "Исследовать поиск минимума функции при наличии ограничений.",
    statement:
      "Студент изучает задачу оптимизации, влияние ограничений на область допустимых решений и идею штрафных функций.",
    formulas: [
      "f(x) → min",
      "gᵢ(x) ≤ 0",
      "F(x)=f(x)+rΣmax(0,gᵢ(x))²"
    ],
    steps: [
      {
        title: "Шаг 1. Задаём целевую функцию",
        text: "Целевая функция определяет величину, которую необходимо минимизировать.",
        code: `def objective(x):
    return (x + 1) ** 2`
      },
      {
        title: "Шаг 2. Добавляем ограничение",
        text: "Если ограничение нарушено, к функции добавляется штраф.",
        code: `def penalty(x):
    if x < 0:
        return 100 * x * x
    return 0`
      },
      {
        title: "Шаг 3. Выполняем поиск минимума",
        text: "В учебном примере используется перебор точек, чтобы показать идею штрафной функции.",
        code: `def target_function(x):
    return objective(x) + penalty(x)`
      }
    ],
    fullCode: `best_x = -5
best_y = 10**9

x = -5
h = 0.01

while x <= 5:
    objective = (x + 1) ** 2

    if x < 0:
        penalty = 100 * x * x
    else:
        penalty = 0

    y = objective + penalty

    if y < best_y:
        best_y = y
        best_x = x

    x += h

print("Минимум с учётом ограничения:", round(best_x, 3))
print("Значение штрафной функции:", round(best_y, 6))`

  }
];