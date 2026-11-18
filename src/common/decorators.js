import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';

export function decorateController(target, path) {
  Controller(path)(target);
}

export function decoratePost(target, method, path) {
  Post(path)(target.prototype, method, Object.getOwnPropertyDescriptor(target.prototype, method));
}

export function decorateGet(target, method, path) {
  Get(path)(target.prototype, method, Object.getOwnPropertyDescriptor(target.prototype, method));
}

export function decorateRequest(target, method, index) {
  Req()(target.prototype, method, index);
}

export function decorateBody(target, method, index) {
  Body()(target.prototype, method, index);
}

export function decorateResponse(target, method, index) {
  Res({ passthrough: true })(target.prototype, method, index);
}

export function decorateGuard(target, guard) {
  UseGuards(guard)(target);
}

export function decorateMethodGuard(target, method, guard) {
  UseGuards(guard)(target.prototype, method, Object.getOwnPropertyDescriptor(target.prototype, method));
}
