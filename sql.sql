
INSERT INTO public.plan_plan(
	plan_rf, item_rf, num_plan, sd_rf, num_day, nums_plan, num_fact, nums_fact)SELECT plan_rf, c.component_rf, pp.num_plan, c.amount, pp.num_plan * c.amount AS num_plan2, sd_rf, num_day,
			'{' ||
            pp.nums_plan[1] * c.amount || ',' ||
            pp.nums_plan[2] * c.amount ||
			'}' AS nums_plan2,
			pp.num_fact * c.amount AS num_fact2,
			'{' ||
            pp.nums_fact[1] * c.amount || ',' ||
            pp.nums_fact[2] * c.amount ||
			'}' AS nums_fact2,
			 num_fact, nums_plan, nums_fact, pp.item_rf, i.item_name, co.item_name
	FROM (((public.plan_plan pp
	  LEFT JOIN item_list i ON pp.item_rf = i.item_id)
	  LEFT JOIN compositions c ON pp.item_rf = c.product_rf )
	  LEFT JOIN item_list co ON c.component_rf = co.item_id)
	WHERE pp.num_plan > 0
	  AND co.spr_rf = 18
	AND pp.plan_rf = 534
	ORDER BY co.item_name, i.item_name



-- Расчет плана и факта на арматуру
INSERT INTO public.plan_plan(
	plan_rf, item_rf, num_plan, sd_rf, num_day, nums_plan, num_fact, nums_fact)
	SELECT plan_rf, c.component_rf, SUM(pp.num_plan * c.amount) AS num_plan2, sd_rf, 0 AS num_day, 
			CAST ('{' || 
            SUM(pp.nums_plan[1] * c.amount) || ',' || 
            SUM(pp.nums_plan[2] * c.amount) || ',' ||
            SUM(pp.nums_plan[3] * c.amount) || ',' ||
            SUM(pp.nums_plan[4] * c.amount) || ',' ||
            SUM(pp.nums_plan[5] * c.amount) || ',' ||
            SUM(pp.nums_plan[6] * c.amount) || ',' ||
            SUM(pp.nums_plan[7] * c.amount) || ',' ||
            SUM(pp.nums_plan[8] * c.amount) || ',' ||
            SUM(pp.nums_plan[9] * c.amount) || ',' ||
            SUM(pp.nums_plan[10] * c.amount) || ',' ||
            SUM(pp.nums_plan[11] * c.amount) || ',' ||
            SUM(pp.nums_plan[12] * c.amount) || ',' ||
            SUM(pp.nums_plan[13] * c.amount) || ',' ||
            SUM(pp.nums_plan[14] * c.amount) || ',' ||
            SUM(pp.nums_plan[15] * c.amount) || ',' ||
            SUM(pp.nums_plan[16] * c.amount) || ',' ||
            SUM(pp.nums_plan[17] * c.amount) || ',' ||
            SUM(pp.nums_plan[18] * c.amount) || ',' ||
            SUM(pp.nums_plan[19] * c.amount) || ',' ||
            SUM(pp.nums_plan[20] * c.amount) || ',' ||
            SUM(pp.nums_plan[21] * c.amount) || ',' ||
            SUM(pp.nums_plan[22] * c.amount) || ',' ||
            SUM(pp.nums_plan[23] * c.amount) || ',' ||
            SUM(pp.nums_plan[24] * c.amount) || ',' ||
            SUM(pp.nums_plan[25] * c.amount) || ',' ||
            SUM(pp.nums_plan[26] * c.amount) || ',' ||
            SUM(pp.nums_plan[27] * c.amount) || ',' ||
            SUM(pp.nums_plan[28] * c.amount) || ',' ||
            SUM(pp.nums_plan[29] * c.amount) || ',' ||
            SUM(pp.nums_plan[30] * c.amount) || ',' ||
            SUM(pp.nums_plan[31] * c.amount) ||
			'}' AS NUMERIC[]) AS nums_plan2, 
			SUM(pp.num_fact * c.amount) AS num_fact2,  
			CAST ('{' || 
            SUM(coalesce(pp.nums_fact[1], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[2], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[3], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[4], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[5], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[6], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[7], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[8], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[9], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[10], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[11], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[12], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[13], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[14], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[15], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[16], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[17], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[18], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[19], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[20], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[21], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[22], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[23], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[24], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[25], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[26], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[27], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[28], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[29], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[30], 0) * c.amount) || ',' ||
            SUM(coalesce(pp.nums_fact[31], 0) * c.amount) ||
			'}' AS NUMERIC[]) AS nums_fact2
	FROM (((public.plan_plan pp
	  LEFT JOIN item_list i ON pp.item_rf = i.item_id)
	  LEFT JOIN compositions c ON pp.item_rf = c.product_rf )
	  LEFT JOIN item_list co ON c.component_rf = co.item_id)
	WHERE pp.num_plan > 0
	  AND co.spr_rf = 18
	AND pp.plan_rf = 534
	GROUP BY  plan_rf, c.component_rf, sd_rf 





SELECT plan_rf, i.item_name, item_rf, num_plan, sd_rf, num_day, nums_plan, num_fact, nums_fact, i.spr_rf
	FROM (public.plan_plan pp
	  LEFT JOIN item_list i ON pp.item_rf = i.item_id)
	WHERE pp.num_plan > 0
	  AND i.spr_rf = 18
	AND pp.plan_rf = 534
	ORDER BY  sd_rf, i.item_name

-- УДАЛЕНИЕ ПЛАНА АРМАТУРЫ
	 UPDATE plan_plan
  SET nums_fact = '{0}'
	WHERE item_rf IN (SELECT item_id FROM item_list WHERE spr_rf = 18)
	AND plan_rf = 534
	;
	DELETE FROM public.plan_plan
--SELECT * FROM public.plan_plan
	WHERE item_rf IN (SELECT item_id FROM item_list WHERE spr_rf = 18)
	AND plan_rf = 534


















select f.*, i.item_name from fcformovka f
  left join item_list i ON f.fc_rf = i.item_id
where doc_rf > 3790
order by 1 desc




select f.*, h.*, i.item_name
from ((fcformovka f
  left join item_list i ON f.fc_rf = i.item_id)
  left join fcformovka_h h ON f.doc_rf = h.doc_id)
where doc_rf =3794



update fcformovka f
set fc_rf = fc_rf
where doc_rf = 3802
      and fc_rf = 62













CREATE OR REPLACE FUNCTION rep_formovka_daily(dtb DATE, dte DATE)
  RETURNS TABLE(sd_name VARCHAR, fc_name VARCHAR, fc_num NUMERIC []) AS
$$
DECLARE
  dt       DATE;
  i        INTEGER;
  r        RECORD;
  r2       RECORD;
  days_num INTEGER;
  dt_array DATE [];
BEGIN

-- Формирование шапки

  sd_name := 'Пролёт';
  fc_name := 'ЖБИ';

  i := 1;
  dt := dtb;
  WHILE dt <= dte LOOP
    fc_num [i] = extract(DAY FROM dt);
    dt_array [i] = dt;
    i := i + 1;
    dt := dt + 1;
  END LOOP;
  days_num := i - 1;
  RETURN NEXT;
-- Конец формирования шапки

  FOR r IN
  SELECT DISTINCT
    h.sd_rf, t.fc_rf, sd.item_name AS sd_name, fc.item_name AS fc_name
  FROM (((fcformovka_h h
    LEFT JOIN fcformovka t ON h.doc_id = t.doc_rf)
    LEFT JOIN item_list sd ON h.sd_rf = sd.item_id)
    LEFT JOIN item_list fc ON t.fc_rf = fc.item_id)
  WHERE h.dt >= dtb
        AND h.dt <= dte
        AND t.fc_rf IN (13, 112, 279, 635, 2887, 2889, 2890)  -- Пока работаем только с двумя ЖБИ
  ORDER BY 3, 4
  LOOP
    sd_name = r.sd_name;
    fc_name = r.fc_name;

    FOR i IN 1..days_num LOOP
      fc_num [i] := 0;
    END LOOP;
--    RETURN NEXT;

    FOR r2 IN -- Для каждой пары Пролёт-ЖБИ
    SELECT
      substr(cast(h.dt AS VARCHAR), 1, 10) AS cdt,
      sd.item_name                         AS sd_name,
      fc.item_name                         AS fc_name,
      SUM(t.fc_num)                        AS fc_num
    FROM (((fcformovka_h h
      LEFT JOIN fcformovka t ON h.doc_id = t.doc_rf)
      LEFT JOIN item_list sd ON h.sd_rf = sd.item_id)
      LEFT JOIN item_list fc ON t.fc_rf = fc.item_id)
    WHERE h.dt >= dtb
          AND h.dt <= dte+1
          AND h.sd_rf = r.sd_rf
          AND t.fc_rf = r.fc_rf
    GROUP BY substr(cast(h.dt AS VARCHAR), 1, 10), sd.item_name, fc.item_name
    ORDER BY sd.item_name, fc.item_name
    LOOP
      dt := r2.cdt; -- Приводим к типу ДАТА для подстановки в функцию array_position
      i := array_position(dt_array, dt);
      fc_num [i] := r2.fc_num;
    END LOOP;

    RETURN NEXT;
  END LOOP;


END
$$ LANGUAGE plpgsql;