const request = require('supertest');
const server = require('../server');  // ใช้ server ที่ส่งออกจาก server.js

// Generate random email for testing
const generateTestEmail = () => {
  const timestamp = Date.now();
  return `carRenterTest${timestamp}@test.com`;
};

describe('Auth Controller Tests', () => {

  // 1. ทดสอบการลงทะเบียนผู้ใช้
  const User = require('../models/user');  // สมมติว่า User เป็นโมเดลผู้ใช้ในระบบ
  let testEmail;

  test('TC1 : should register a user successfully with valid data', async () => {
    testEmail = generateTestEmail();
    const response = await request(server)
      .post('/api/v1/auth/register')
      .send({
        name: 'CarRenterTest',
        email: testEmail,
        password: '123456',
        telephoneNumber: '0123456789',
        driverLicense: '123456',
        role: 'car-renter'
      });
    expect(response.status).toBe(201); // คาดหวังว่า status code จะเป็น 201
    expect(response.body).toHaveProperty('token'); // คาดหวังว่า response จะมี token

  });
  
  afterAll(async () => {
    const user = await User.findOne({ email: testEmail });
    if (user) {
      await user.deleteOne();  // ลบบัญชีผู้ใช้จากฐานข้อมูล
    }
  });
  

  // 2. ทดสอบการลงทะเบียนผู้ใช้ที่อีเมลซ้ำ
  test('TC2 : should return error if email already exists', async () => {
    const response = await request(server)
      .post('/api/v1/auth/register')
      .send({
        name: 'CarRenterTest2',
        email: 'carRenterTest@gmail.com',  // ใช้อีเมลที่มีอยู่แล้ว
        password: '123456',
        telephoneNumber: '0123456789',
        driverLicense: '123456',
        role: 'car-renter'
      });
    expect(response.status).toBe(400);  // คาดหวังว่า status code จะเป็น 400 (อีเมลซ้ำ)
    expect(response.body.message).toBe('User already exists');  // ข้อความที่ส่งกลับ
  });

  // 3. ทดสอบการลงทะเบียนผู้ใช้ที่ไม่มีข้อมูลสำคัญ
  test('TC3 : should return error if required field is missing', async () => {
    const response = await request(server)
      .post('/api/v1/auth/register')
      .send({
        name: 'CarRenterTest',
        email: 'carRenterTest3@gmail.com',
        password: '',  // ไม่มีการระบุรหัสผ่าน
        telephoneNumber: '0123456789',
        driverLicense: '123456',
        role: 'car-renter'
      });
    expect(response.status).toBe(400);  // คาดหวังว่า status code จะเป็น 400 (ขาดข้อมูล)
    expect(response.body.message).toBe('All fields are required');  // ข้อความที่ส่งกลับ
  });

  // 4. ทดสอบการเข้าสู่ระบบ
  test('TC4 : should login successfully with valid credentials', async () => {
    const response = await request(server)
      .post('/api/v1/auth/login')
      .send({
        email: 'carRenterTest@gmail.com',
        password: '123456'
      });
    expect(response.status).toBe(200); // คาดหวังว่า status code จะเป็น 200
    expect(response.body).toHaveProperty('token'); // คาดหวังว่า response จะมี token
  });
  
  // 5. ทดสอบการเข้าสู่ระบบด้วยข้อมูลไม่ถูกต้อง
  test('TC5 : should return error for invalid login credentials', async () => {
    const response = await request(server)
      .post('/api/v1/auth/login')
      .send({
        email: 'carRenterTest@gmail.com',
        password: '111111'  // รหัสผ่านผิด
      });
    expect(response.status).toBe(401);  // คาดหวังว่า status code จะเป็น 401 (การเข้าสู่ระบบไม่สำเร็จ)
    expect(response.body.error).toBe(undefined);  // ข้อความที่ส่งกลับ
  });

  // 6. ทดสอบการดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบแล้ว
  test('TC6 : should get current user profile', async () => {
    const loginResponse = await request(server)
      .post('/api/v1/auth/login')
      .send({
        email: 'carRenterTest@gmail.com',
        password: '123456'
      });

    const token = loginResponse.body.token;

    const response = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200); // คาดหวังว่า status code จะเป็น 200
    expect(response.body).toHaveProperty('data');  // คาดหวังว่า response.body จะมี `data` แทน `user`
    expect(response.body.data).toHaveProperty('name', 'CarRenterTest2');  // ชื่อผู้ใช้ต้องตรงกับที่ลงทะเบียน
  });

  // 7. ทดสอบการดึงข้อมูลผู้ใช้ที่ไม่มี token (ไม่ผ่านการยืนยันตัวตน)
  test('TC7 : should return error if token is not provided for current user', async () => {
    const response = await request(server)
      .get('/api/v1/auth/me');
    expect(response.status).toBe(401);  // คาดหวังว่า status code จะเป็น 401 (Unauthorized)
    expect(response.body.error).toBe('Not authorized, no token provided');  // ข้อความที่ส่งกลับ
  });

});