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
        AND t.fc_rf IN (13, 112)  -- Пока работаем только с двумя ЖБИ
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