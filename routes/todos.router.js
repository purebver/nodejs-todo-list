import express from 'express';
import Joi from 'joi';
import Todo from '../schemas/todo.schema.js';

const router = express.Router();

const createTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

router.post('/todos', async (req, res, next) => {
  // const { value } = req.body;
  try {
    const validation = await createTodoSchema.validateAsync(req.body); //검증

    const { value } = validation;

    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다.' });
    }

    //findOne 데이터 한개만 조회 sort(+오름차순), sort(-내림차순)
    const todoMaxOrder = await Todo.findOne().sort('-order').exec();

    // 해야할일 순서가 존재하면 위에서 조회한 값에서 +1 하고 없다면 1을 할당함
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    //등록
    const todo = new Todo({ value, order });
    await todo.save();

    return res.status(201).json({ todo: todo });
  } catch (error) {
    //app.js의 라우터 다음 미들웨어를 실행 = 에러처리 실행
    next(error);
  }
});

//조회
router.get('/todos', async (req, res, next) => {
  const todos = await Todo.find().sort('-order').exec();

  return res.status(200).json({ todos });
});

//순서 변경(순서 교환), 완료, 내용변경
router.patch('/todos/:todoId', async (req, res, next) => {
  // 변경할 객체 _id 선택
  const { todoId } = req.params;
  // 원하는 order 변경하기 위한 order 값
  const { order, done, value } = req.body;

  // 해당 ID값을 가진 변경할 객체가 없다면 에러를 발생시킵니다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
  }

  if (order) {
    // 바꿀 order 값을 가지고 있는 다른 객체 검색
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      // 만약, 이미 해당 order 값을 가진 다른 객체가 있다면, 해당 객체의 order 값을 변경하고 저장합니다.
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
    currentTodo.order = order;
  }

  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  // 변경된 '해야할 일'을 저장합니다.
  await currentTodo.save();

  return res.status(200).json({});
});

router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();

  if (!todo) {
    return res.status(404).json({ errorMessage: '존재하지 않는 정보입니다.' });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;
