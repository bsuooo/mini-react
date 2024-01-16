1. 首先main.jsx中先ReactDom.createRoot(document.getElementById('root')) 根节点
2. ReactDom.createRoot 记录了根节点 并返回了render函数 render其实就是React.render
3. main.jsx 调用render, 传入App(Function Component), ReactDom接收到App后 调用 React.render 传入 App与根节点
4. render 格式化第一个节点(root节点) 为 {dom: 根节点, props: {children: [App]}} 并记录 (root 一份, nextUnitOfWork 一份)
5. React 中有workLoop方法, 递归检测系统空闲事件(requestIdleCallback)与 nextUnitOfWork 因为4中nextUnitOfWork变化了, 所以有空闲时间(IdleDeadline > 0)开始格式化链表并接收返回值nextUnitOfWork = perWorkOfUnit()
6. perWorkOfUnit方法进行格式化 根据节点type 区分调用 updateFunctionComponent 或 updateHostComponent
7. 检测fiber.child 存在就返回, 如果没有则检测fiber.sibling, 存在就返回, 不存在要将当前节点的sibling挂载相邻祖先(while) 即返回相邻祖先 或空,如果有值, nextUnitOfWork变化, 继续调用
8. 等到最后 nextUnitOfWork 为空了 且要注意 root 要有值, 开始挂载dom commitRoot()
9. 递归将当前节点挂载到他所能找到的最近的一个有dom的祖先, 然后开始挂载他的children/sibling commitWork()