import apiWorker from '../../worker.js';

export async function onRequest(context) {
  return apiWorker.fetch(context.request, context.env, context);
}
