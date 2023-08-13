# Postgres-queue
This project implements a queue service (like kafka and rabbitMQ) using a Postgresql instance as broker. A producer sends a new order to the Order table, but the API is running in several clusters managed by pm2, and each cluster has a cron job running every minute that work as consumer, processing a row from the Order table.

![image](./diagram.drawio.png)

## Technologies
- pm2
- NestJS
- Postgresql
- Prisma

## How do this works?
The code is inside `src/modules/consumer/consumer.service.ts`:

```typescript
  async processOrders() {

    let pending = true

    while(pending) {
      pending = await this.prisma.$transaction(async (tx) => {
        const pendingOrders: any[] = await tx.$queryRaw`
          select o.*
          from "Order" o 
          where o.status = 'PENDING'
          order by o.created_at asc 
          limit 50
          for update skip locked
        `;

        if(!pendingOrders.length) {
          return false
        }
  
        await Promise.all(
          pendingOrders.map(async order => {
            await tx.order.update({
              where: {
                id: order.id
              },
              data: {
                status: orderStatus.COMPLETED
              }
            })
  
            console.log(`Order ${order.id} has been processed`);
          })
        )

        return true
      })
    }
  }
```
When the cron job gets the pending orders the select query is made by using two clausules from Postgresql: [FOR UPDATE](https://www.postgresql.org/docs/9.0/sql-select.html#SQL-FOR-UPDATE-SHARE) and [SKIP LOCKED](https://www.postgresql.org/docs/current/sql-select.html).

The `FOR UPDATE` causes the rows retrieved by the `SELECT` statement to be locked as though for update, and the `SKIP LOCKED` skips any selected rows that cannot be immediately locked, then all rows that is being processed by another job on another cluster is not touched by the current job.

The `SELECT` query is limited by 50 itens per time, this is a way to avoid memory leak if the table has a huge amount of items. But the `while` block is used to make sure that, even with the 50 items limit, the job will try to proccess every payment order from the queue.

By wraping this process into a single transaction using [interactive transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions) from prisma and limitting it for 50 items per time, we can guarantee that this process is gonna be a short-running transaction, which keeps the consistency of the operation while avoiding memory leak of a long-running transaction.

## How to run
1. Run the command `docker-compose up` to create a new Postgres instance
2. Run the command `npm install` to install all packages
3. Run the command `npm run build` to build the app
4. Run the command `npm run start:cluster` to run all 3 clusters instances
5. Send a order to the Order table by making a `POST` to `/order`
6. Run the command `pm2 logs main` to see all logs from each cluster