import mongoose from 'mongoose';

const connect = () => {
  mongoose
    .connect(
      'mongodb+srv://sparta-user:aaaa4321@express-mongo.bc2i9.mongodb.net/?retryWrites=true&w=majority&appName=express-mongo',
      {
        dbName: 'todo_memo', //데이터베이스명
      }
    )
    .then(() => console.log('몽고DB연결에 성공하였습니다'))
    .catch((err) => console.log(`몽고DB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on('error', (err) => {
  console.error('몽고DB 연결 에러', err);
});

export default connect;
