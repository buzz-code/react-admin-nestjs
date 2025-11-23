import { Column, DataSource, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "../entities/Klass.entity";
import { Lesson } from "../entities/Lesson.entity";

@ViewEntity("lesson_klass_name", {
  expression: `
    SELECT lessons.id AS id,
           lessons.user_id AS user_id,
           GROUP_CONCAT(DISTINCT klasses.name SEPARATOR ', ') AS name
    FROM lessons
    LEFT JOIN JSON_TABLE(
      lessons.klass_reference_ids_json,
      "$[*]" COLUMNS(klass_id INT PATH "$")
    ) AS jt ON 1=1
    LEFT JOIN klasses ON klasses.id = jt.klass_id
    GROUP BY lessons.id, lessons.user_id
  `
})
export class LessonKlassName implements IHasUserId {
  @Column()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ name: 'name' })
  name: string;
}
