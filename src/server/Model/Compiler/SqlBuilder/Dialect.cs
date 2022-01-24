﻿// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler.SqlBuilder
{
    public interface ISqlDialect
    {
        public string CurrentDate();
        public string CreateNullColumn(ColumnType type);
        public string DateAdd(string origDate, int interval, DateIncrementType incrType);
    }

    public class SqlServerDialect : ISqlDialect
    {
        public string CurrentDate() => "GETDATE()";
        public string CreateNullColumn(ColumnType type) => $"CONVERT(NULL, {ToSqlType(type)})";

        string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.STRING  => "NVARCHAR(100)",
                ColumnType.INTEGER => "INT",
                ColumnType.DECIMAL => "DECIMAL(18,3)",
                ColumnType.DATE    => "DATETIME",
                ColumnType.BOOLEAN => "BIT",
                _ => "NVARCHAR(100)",
            };
        }
    }

    public enum ColumnType
    {
        STRING = 1,
        INTEGER = 2,
        DECIMAL = 3,
        DATE = 4,
        BOOLEAN = 5
    }

    public abstract class SqlDialect
    {
        public string DateAdd(string origDate, int inteval, )

        public static class Time
        {
            public const string SECOND = "SECOND";
            public const string MINUTE = "MINUTE";
            public const string HOUR = "HOUR";
            public const string DAY = "DAY";
            public const string WEEK = "WEEK";
            public const string MONTH = "MONTH";
            public const string YEAR = "YEAR";
        }

        public static class Syntax
        {
            public const string SELECT = "SELECT";
            public const string FROM = "FROM";
            public const string WHERE = "WHERE";
            public const string GROUP_BY = "GROUP BY";
            public const string HAVING = "HAVING";
            public const string ORDER_BY = "ORDER BY";
            public const string COUNT = "COUNT";
            public const string AND = "AND";
            public const string NOT = "NOT";
            public const string MIN = "MIN";
            public const string MAX = "MAX";
            public const string IN = "IN";
            public const string AS = "AS";
            public const string UNION_ALL = "UNION ALL";
            public const string BETWEEN = "BETWEEN";
            public const string SINGLE_QUOTE = "'";
            public const string WILDCARD = "%";
            public const string LIKE = "LIKE";
            public const string OR = "OR";
            public const string LEFT_JOIN = "LEFT JOIN";
            public const string INNER_JOIN = "INNER JOIN ";
            public const string ON = "ON";
            public const string DATEADD = "DATEADD";
            public const string IS_NULL = "IS NULL";
            public const string EXISTS = "EXISTS";
            public const string NOW = "GETDATE()";
            public const string INTERSECT = "INTERSECT";
            public const string EXCEPT = "EXCEPT";
            public const string DISTINCT = "DISTINCT";
            public const string DECLARE = "DECLARE";
        }

        public static class Types
        {
            public const string BIT = "BIT";
            public const string NVARCHAR = "NVARCHAR";
        }

        public static readonly string[] IllegalCommands = { "UPDATE ", "TRUNCATE ", "EXEC ", "DROP ", "INSERT ", "CREATE ", "DELETE ", "MERGE ", "SET " };

        public static readonly HashSet<string> DateFilterTypes = new HashSet<string> { "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "YEAR" };
    }
    }
}
