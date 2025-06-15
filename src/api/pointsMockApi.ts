// 所有 mock 接口均为2秒延迟，xstate v5 promise actor

export function mockFetchUser() {
  return new Promise<{ id: string } | null>((resolve) => {
    setTimeout(() => resolve(null), 2000); // 初始未登录
  });
}

export function mockSignin() {
  return new Promise<{ id: string }>((resolve) => {
    setTimeout(() => resolve({ id: "user1" }), 2000);
  });
}

export function mockFetchSubscription() {
  return new Promise<{ subscribed: boolean }>((resolve) => {
    setTimeout(() => resolve({ subscribed: Math.random() > 0.5 }), 2000); // 50%已经订阅
  });
}

export function mockSubscribe() {
  return new Promise<{ success: boolean }>((resolve) => {
    setTimeout(() => resolve({ success: true }), 2000);
  });
}

export function mockFetchPoints() {
  const result = new Promise<{ points: number }>((resolve) => {
    setTimeout(() => resolve({ points: 200 }), 2000); // 初始有积分
  });
  return result;
}

export function mockDonate() {
  return new Promise<{ success: boolean }>((resolve) => {
    setTimeout(() => resolve({ success: Math.random() > 0.5 }), 2000); // 50%成功
  });
}
