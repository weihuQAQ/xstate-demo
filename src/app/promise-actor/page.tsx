"use client";

import React from "react";
import { useMachine } from "@xstate/react";
import { pointsMachine } from "@/state/pointsMachine";
import Button from "@mui/material/Button";

export default function PointsPage() {
  const [state, send] = useMachine(pointsMachine);

  // 状态和上下文
  const { user, subscription, points, donateResult } = state.context;

  // UI 渲染
  if (state.matches("unauthenticated")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>未登录，请先登录</h2>
        <Button
          variant="contained"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => send({ type: "SIGNIN" })}
        >
          登录
        </Button>
      </div>
    );
  }
  if (state.matches("signing_in")) {
    return <div className="flex items-center justify-center min-h-screen">登录中...</div>;
  }
  if (state.matches({ authenticated: "not_subscribed" })) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>未订阅积分服务</h2>
        <Button
          variant="contained"
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => send({ type: "SUBSCRIBE" })}
        >
          订阅
        </Button>
      </div>
    );
  }
  if (state.matches({ authenticated: "subscribing" })) {
    return <div className="flex items-center justify-center min-h-screen">订阅中...</div>;
  }
  if (state.matches({ authenticated: "subscription_loading" })) {
    return <div className="flex items-center justify-center min-h-screen">正在加载订阅信息...</div>;
  }
  if (state.matches({ authenticated: { subscribed: "points_loading" } })) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>积分加载中...</h2>
      </div>
    );
  }

  if (state.matches({ authenticated: { subscribed: "points_empty" } })) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>当前积分为 0</h2>
      </div>
    );
  }
  if (state.matches({ authenticated: { subscribed: "points_available" } })) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>当前积分：{points}</h2>
        <Button
          disabled={points === 0}
          variant="contained"
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
          onClick={() => send({ type: "DONATE" })}
        >
          捐赠积分
        </Button>
      </div>
    );
  }
  if (state.matches({ authenticated: { subscribed: "donating" } })) {
    return <div className="flex items-center justify-center min-h-screen">捐赠中...</div>;
  }
  if (state.matches({ authenticated: { subscribed: "donate_success" } })) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>捐赠成功！</h2>
        <Button
          variant="contained"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => send({ type: "FETCH_POINTS" })}
        >
          返回
        </Button>
      </div>
    );
  }
  if (state.matches({ authenticated: { subscribed: "donate_failed" } })) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>捐赠失败，请重试</h2>
        <Button
          variant="contained"
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => send({ type: "RETRY" })}
        >
          重试
        </Button>
      </div>
    );
  }
  return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
}
